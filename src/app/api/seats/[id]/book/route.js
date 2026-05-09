import { supabase, getUserFromRequest, jsonResponse } from '@/lib/auth';

const BOOKING_TIMEOUT_MS = 300000;
const MAX_SEATS_PER_USER = 3;

export async function POST(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return jsonResponse({ error: 'Token tidak valid atau expired. Silakan login ulang.' }, 401);
    }

    const { id } = await params;
    const seatId = id;
    const lockExpires = new Date(Date.now() + BOOKING_TIMEOUT_MS).toISOString();

    // Cek jumlah kursi aktif user
    const { count } = await supabase
      .from('seats')
      .select('id', { count: 'exact', head: true })
      .eq('locked_by', user.id)
      .in('status', ['booking', 'booked']);

    if ((count || 0) >= MAX_SEATS_PER_USER)
      return jsonResponse({ error: `Maksimal ${MAX_SEATS_PER_USER} kursi per pengguna` }, 400);

    // Atomic update
    const { data: updated, error } = await supabase
      .from('seats')
      .update({ status: 'booking', locked_by: user.id, lock_expires_at: lockExpires })
      .eq('id', seatId)
      .eq('status', 'available')
      .select();

    if (error) {
      return jsonResponse({ error: 'Database error: ' + error.message }, 500);
    }

    if (!updated || updated.length === 0)
      return jsonResponse({ error: 'Kursi sudah tidak tersedia. Silakan pilih kursi lain.' }, 409);

    return jsonResponse({ message: `Kursi ${seatId} berhasil dipilih`, seat: updated[0] });
  } catch (err) {
    return jsonResponse({ error: 'Kesalahan server: ' + err.message }, 500);
  }
}

export async function OPTIONS() {
  return jsonResponse({});
}