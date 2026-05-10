import { supabase, jsonResponse } from '@/lib/auth';

// Tambahkan ini agar data tidak dicache
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('seats')
      .select(`
        id, label, shape, x_pos, y_pos, status, lock_expires_at, locked_by,
        users:locked_by ( id, nama, npm, email )
      `)
      .order('id');

    if (error) throw error;

    const now = new Date();
    const expiredSeatIds = [];

    const seats = data.map((seat) => {
      // Auto-release: booking yang expired (pending timeout)
      if (
        seat.status === 'booking' &&
        seat.lock_expires_at &&
        new Date(seat.lock_expires_at) < now
      ) {
        expiredSeatIds.push(seat.id);
        return { ...seat, status: 'available', locked_by: null, users: null, lock_expires_at: null };
      }

      // Auto-release: booked yang waktunya sudah habis
      if (
        seat.status === 'booked' &&
        seat.lock_expires_at &&
        new Date(seat.lock_expires_at) < now
      ) {
        expiredSeatIds.push(seat.id);
        return { ...seat, status: 'available', locked_by: null, users: null, lock_expires_at: null };
      }

      return seat;
    });

    // Update database untuk kursi yang expired (bersihkan dari DB juga)
    if (expiredSeatIds.length > 0) {
      console.log('[SEATS] Auto-releasing expired seats:', expiredSeatIds);
      
      // Release seats
      await supabase.from('seats')
        .update({ status: 'available', locked_by: null, lock_expires_at: null })
        .in('id', expiredSeatIds);

      // Mark reservations as completed
      await supabase.from('reservations')
        .update({ status: 'completed', ended_at: now.toISOString() })
        .in('seat_id', expiredSeatIds)
        .eq('status', 'active');
    }

    return jsonResponse({ seats });
  } catch (err) {
    console.error('getSeats error:', err);
    return jsonResponse({ error: 'Gagal mengambil data kursi' }, 500);
  }
}

export async function OPTIONS() {
  return jsonResponse({});
}