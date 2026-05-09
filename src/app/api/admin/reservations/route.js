import { supabase, getUserFromRequest, jsonResponse } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin')
      return jsonResponse({ error: 'Akses ditolak. Hanya admin.' }, 403);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('reservations')
      .select(`
        id, status, duration_type, started_at, ended_at, created_at,
        users:user_id ( id, nama, npm, email ),
        seats:seat_id ( id, label, shape )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return jsonResponse({
      reservations: data || [],
      pagination: { page, limit, total: count || 0 },
    });
  } catch (err) {
    console.error('getAllReservations error:', err);
    return jsonResponse({ error: 'Gagal mengambil data reservasi' }, 500);
  }
}

export async function OPTIONS() {
  return jsonResponse({});
}
