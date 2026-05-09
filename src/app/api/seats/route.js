import { supabase, jsonResponse } from '@/lib/auth';

// Tambahkan ini agar data tidak dicache (Sangat penting untuk sistem real-time)
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
    const seats = data.map((seat) => {
      // Normalisasi Expiry
      if (
        seat.status === 'booking' &&
        seat.lock_expires_at &&
        new Date(seat.lock_expires_at) < now
      ) {
        return { ...seat, status: 'available', locked_by: null, users: null, lock_expires_at: null };
      }
      return seat;
    });

    return jsonResponse({ seats });
  } catch (err) {
    console.error('getSeats error:', err);
    return jsonResponse({ error: 'Gagal mengambil data kursi' }, 500);
  }
}

export async function OPTIONS() {
  return jsonResponse({});
}