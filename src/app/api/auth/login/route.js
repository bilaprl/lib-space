import bcrypt from 'bcryptjs';
import { supabase, generateToken, jsonResponse, isUniversityEmail } from '@/lib/auth';

const ADMIN_CREDENTIALS = [
  {
    email: 'adminperpus@unsil.ac.id',
    password: 'perpus2026',
    user: {
      id: 'admin-hardcoded-001',
      email: 'adminperpus@unsil.ac.id',
      nama: 'Administrator LibSpace',
      npm: null,
      role: 'admin',
      avatar_url: null,
    }
  }
];

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password)
      return jsonResponse({ error: 'Email/NPM dan password wajib diisi' }, 400);

    // ── 1. Cek Hardcoded Admin (TIDAK DIGANGGU) ──
    const adminMatch = ADMIN_CREDENTIALS.find(
      (a) => a.email.toLowerCase() === identifier.toLowerCase()
    );

    if (adminMatch) {
      if (password !== adminMatch.password) {
        return jsonResponse({ error: 'Password salah' }, 401);
      }
      const token = generateToken(adminMatch.user);
      return jsonResponse({ token, user: adminMatch.user });
    }

    // ── 2. Cari User di Database ──
    const isEmail = identifier.includes('@');
    let { data: user, error: userError } = isEmail
      ? await supabase.from('users').select('*').eq('email', identifier.toLowerCase()).maybeSingle()
      : await supabase.from('users').select('*').eq('npm', identifier).maybeSingle();

    // ── 3. LOGIKA AUTO-REGISTER (Tambahkan di sini) ──
    if (!user) {
      // Hanya auto-register jika yang dimasukkan adalah email Unsil valid
      if (isEmail && isUniversityEmail(identifier)) {
        const { data: newUser, error: regError } = await supabase
          .from('users')
          .insert([{ 
            email: identifier.toLowerCase(), 
            password_hash: password, // Simpan plain text dulu agar sinkron dengan SQL Editor Anda
            nama: identifier.split('@')[0], 
            role: 'student', 
            npm: isEmail ? null : identifier, // Jika input NPM, masukkan ke kolom NPM
            is_active: true 
          }])
          .select()
          .single();

        if (regError) return jsonResponse({ error: 'Gagal registrasi otomatis' }, 500);
        user = newUser;
      } else {
        return jsonResponse({ error: 'Email/NPM tidak terdaftar' }, 401);
      }
    }

    // ── 4. Verifikasi Password ──
    if (!user.is_active)
      return jsonResponse({ error: 'Akun Anda telah dinonaktifkan' }, 403);

    const storedHash = user.password_hash || user.password;

    // Cek password (Mendukung Plain Text untuk UAS & Bcrypt)
    let isValid = false;
    if (storedHash === password) {
      isValid = true; // Cocok secara plain text (seperti input manual di SQL Editor)
    } else {
      try {
        isValid = await bcrypt.compare(password, storedHash);
      } catch (e) {
        isValid = false;
      }
    }

    if (!isValid)
      return jsonResponse({ error: 'Email/NPM atau password salah' }, 401);

    // ── 5. Response Sukses ──
    const token = generateToken(user);
    return jsonResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        npm: user.npm,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    return jsonResponse({ error: 'Kesalahan server: ' + err.message }, 500);
  }
}

export async function OPTIONS() {
  return jsonResponse({});
}