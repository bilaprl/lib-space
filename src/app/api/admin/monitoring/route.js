import { supabase, getUserFromRequest, jsonResponse } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin')
      return jsonResponse({ error: 'Akses ditolak. Hanya admin.' }, 403);

    const { data: seats, error } = await supabase
      .from('seats')
      .select(`
        id, label, shape, x_pos, y_pos, status, lock_expires_at, locked_by,
        users:locked_by ( id, nama, npm, email )
      `)
      .order('id');

    if (error) throw error;

    const now = new Date();
    const normalizedSeats = seats.map((seat) => {
      if (seat.status === 'booking' && seat.lock_expires_at && new Date(seat.lock_expires_at) < now) {
        return { ...seat, status: 'available', locked_by: null, users: null, lock_expires_at: null };
      }
      return seat;
    });

    const total = normalizedSeats.length;
    const available = normalizedSeats.filter((s) => s.status === 'available').length;
    const booked = normalizedSeats.filter((s) => s.status === 'booked').length;
    const booking = normalizedSeats.filter((s) => s.status === 'booking').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: dailyVisitors } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', today.toISOString());

    return jsonResponse({
      seats: normalizedSeats,
      summary: {
        total, available, booked, booking,
        occupancyRate: Math.round((booked / total) * 100),
        dailyVisitors: dailyVisitors || 0,
      },
    });
  } catch (err) {
    console.error('getMonitoring error:', err);
    return jsonResponse({ error: 'Gagal mengambil data monitoring' }, 500);
  }
}

export async function OPTIONS() {
  return jsonResponse({});
}
