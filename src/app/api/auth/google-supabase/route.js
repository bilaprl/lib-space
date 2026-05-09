import { supabase, generateToken, jsonResponse, isUniversityEmail } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, nama, avatar_url, google_id } = await request.json();

    if (!email)
      return jsonResponse({ error: 'Email tidak ditemukan' }, 400);

    if (!isUniversityEmail(email))
      return jsonResponse({ error: 'Hanya email universitas (@unsil.ac.id) yang diizinkan' }, 403);

    // Cek apakah user sudah ada
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!user) {
      // Register otomatis user baru
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          nama: nama || email,
          role: 'mahasiswa',
          google_id,
          avatar_url,
          is_active: true,
        })
        .select()
        .single();

      if (createError) {
        console.error('register error:', createError);
        return jsonResponse({ error: 'Gagal membuat akun baru' }, 500);
      }
      user = newUser;
    } else {
      // Update avatar dan google_id jika berubah
      await supabase
        .from('users')
        .update({ avatar_url, google_id })
        .eq('id', user.id);
    }

    if (!user.is_active)
      return jsonResponse({ error: 'Akun Anda telah dinonaktifkan' }, 403);

    const token = generateToken(user);
    return jsonResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        npm: user.npm,
        role: user.role,
        avatar_url: avatar_url || user.avatar_url,
      },
    });
  } catch (err) {
    console.error('google-supabase error:', err);
    return jsonResponse({ error: 'Kesalahan server' }, 500);
  }
}

export async function OPTIONS() {
  return jsonResponse({});
}
