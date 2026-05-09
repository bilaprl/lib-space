import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Supabase client pakai service role key (bypass RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verifikasi JWT token
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Ambil user dari request header Authorization
export const getUserFromRequest = async (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const { data: user } = await supabase
      .from('users')
      .select('id, email, nama, role, npm, is_active')
      .eq('id', decoded.id)
      .single();
    if (!user || !user.is_active) return null;
    return user;
  } catch {
    return null;
  }
};

// Helper response JSON dengan CORS headers
export const jsonResponse = (data, status = 200) => {
  return Response.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

// Validasi domain email universitas
export const ALLOWED_DOMAINS = ['unsil.ac.id', 'student.unsil.ac.id'];
export const isUniversityEmail = (email) =>
  ALLOWED_DOMAINS.includes(email?.split('@')[1]?.toLowerCase());
