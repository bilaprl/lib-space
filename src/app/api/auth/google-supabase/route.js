import { supabase, generateToken, jsonResponse, isUniversityEmail } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, nama, avatar_url, google_id } = await request.json();

    if (!email)
      return jsonResponse({ error: 'Email tidak ditemukan' }, 400);

    if (!isUniversityEmail(email))
      return jsonResponse({ error: 'Hanya email universitas (@unsil.ac.id atau @student.unsil.ac.id) yang diizinkan' }, 403);

    // Cek apakah user sudah ada
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    let user = existingUser;

    if (!user) {
      // Register otomatis user baru — hanya kolom yang pasti ada di tabel
      const insertData = {
        email: email.toLowerCase(),
        nama: nama || email.split('@')[0],
        role: 'student',
        is_active: true,
      };

      // Tambahkan kolom opsional hanya jika ada nilainya
      if (google_id) insertData.google_id = google_id;
      if (avatar_url) insertData.avatar_url = avatar_url;

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(insertData)
        .select()
        .single();

      if (createError) {
        return jsonResponse({ error: 'Gagal membuat akun: ' + createError.message }, 500);
      }
      user = newUser;
    } else {
      // Update avatar dan google_id jika berubah
      const updateData = {};
      if (avatar_url) updateData.avatar_url = avatar_url;
      if (google_id) updateData.google_id = google_id;
      
      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id);
      }
    }

    if (!user.is_active)
      return jsonResponse({ error: 'Akun Anda telah dinonaktifkan oleh admin' }, 403);

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
    return jsonResponse({ error: 'Kesalahan server: ' + err.message }, 500);
  }
}

export async function OPTIONS() {
  return jsonResponse({});
}
