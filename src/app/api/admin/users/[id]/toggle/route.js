import { supabase, getUserFromRequest, jsonResponse } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin')
      return jsonResponse({ error: 'Akses ditolak. Hanya admin.' }, 403);

    const { data: target } = await supabase
      .from('users').select('id, is_active, role').eq('id', params.id).single();

    if (!target) return jsonResponse({ error: 'User tidak ditemukan' }, 404);
    if (target.role === 'admin') return jsonResponse({ error: 'Tidak bisa mengubah akun admin' }, 403);

    await supabase
      .from('users')
      .update({ is_active: !target.is_active })
      .eq('id', params.id);

    return jsonResponse({
      message: `Akun ${!target.is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
    });
  } catch (err) {
    return jsonResponse({ error: 'Gagal mengubah status user' }, 500);
  }
}

export async function OPTIONS() {
  return jsonResponse({});
}
