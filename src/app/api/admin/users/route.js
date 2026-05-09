import { supabase, getUserFromRequest, jsonResponse } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin')
      return jsonResponse({ error: 'Akses ditolak. Hanya admin.' }, 403);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('users')
      .select('id, npm, email, nama, role, is_active, created_at, avatar_url', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return jsonResponse({ users: data || [], pagination: { page, limit, total: count || 0 } });
  } catch (err) {
    console.error('getUsers error:', err);
    return jsonResponse({ error: 'Gagal mengambil daftar user' }, 500);
  }
}

export async function OPTIONS() {
  return jsonResponse({});
}
