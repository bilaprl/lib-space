import { supabase, getUserFromRequest, jsonResponse } from '@/lib/auth';

const BOOKING_TIMEOUT_MS = 300000; // 5 menit
const MAX_SEATS_PER_USER = 3;

export async function POST(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return jsonResponse({ error: 'Token tidak valid atau expired. Silakan login ulang.' }, 401);
    }

    const { id } = await params;
    const seatId = parseInt(id);
    const lockExpires = new Date(Date.now() + BOOKING_TIMEOUT_MS).toISOString();

    // AUTO-CLEANUP: Lepaskan kursi "booking" yang sudah expired untuk user ini
    await supabase
      .from('seats')
      .update({ status: 'available', locked_by: null, lock_expires_at: null })
      .eq('locked_by', user.id)
      .eq('status', 'booking')
      .lt('lock_expires_at', new Date().toISOString());

    // Cek jumlah kursi aktif user (setelah cleanup)
    const { count, error: countError } = await supabase
      .from('seats')
      .select('id', { count: 'exact', head: true })
      .eq('locked_by', user.id)
      .in('status', ['booking', 'booked']);

    const actualCount = typeof count === 'number' ? count : 0;
    console.log('[BOOK] User:', user.id, '| seatId:', seatId, '| activeSeats:', actualCount);

    if (countError) {
      return jsonResponse({ error: 'Gagal cek kuota: ' + countError.message }, 500);
    }

    if (actualCount >= MAX_SEATS_PER_USER)
      return jsonResponse({ error: `Kamu sudah memilih ${actualCount} kursi. Batalkan atau checkout dulu sebelum memilih lagi.` }, 400);

    // Debug: cek status kursi sebelum update
    const { data: currentSeat } = await supabase
      .from('seats')
      .select('id, status, locked_by, lock_expires_at')
      .eq('id', seatId)
      .single();
    console.log('[BOOK] Current seat state:', JSON.stringify(currentSeat));

    // Kalau kursi tidak ada di DB
    if (!currentSeat) {
      return jsonResponse({ error: `Kursi ${seatId} tidak ditemukan di database` }, 404);
    }

    // Kalau statusnya bukan available, coba auto-release dulu (mungkin expired)
    if (currentSeat.status !== 'available') {
      // Coba release jika booking expired atau locked_by user sendiri
      const isExpired = currentSeat.lock_expires_at && new Date(currentSeat.lock_expires_at) < new Date();
      const isOwnSeat = currentSeat.locked_by === user.id;

      if (currentSeat.status === 'booking' && (isExpired || isOwnSeat)) {
        await supabase
          .from('seats')
          .update({ status: 'available', locked_by: null, lock_expires_at: null })
          .eq('id', seatId);
        console.log('[BOOK] Auto-released seat', seatId);
      } else {
        return jsonResponse({ error: 'Kursi sudah tidak tersedia. Silakan pilih kursi lain.' }, 409);
      }
    }

    // Atomic update — hanya berhasil jika kursi masih available
    const { data: updated, error } = await supabase
      .from('seats')
      .update({ status: 'booking', locked_by: user.id, lock_expires_at: lockExpires })
      .eq('id', seatId)
      .eq('status', 'available')
      .select();

    if (error) {
      console.log('[BOOK] Update error:', error);
      return jsonResponse({ error: 'Database error: ' + error.message }, 500);
    }

    if (!updated || updated.length === 0)
      return jsonResponse({ error: 'Kursi sudah tidak tersedia. Silakan pilih kursi lain.' }, 409);

    console.log('[BOOK] Success! Seat', seatId, 'booked by', user.id);
    return jsonResponse({ message: `Kursi ${seatId} berhasil dipilih`, seat: updated[0] });
  } catch (err) {
    console.error('[BOOK] Catch error:', err);
    return jsonResponse({ error: 'Kesalahan server: ' + err.message }, 500);
  }
}

export async function OPTIONS() {
  return jsonResponse({});
}