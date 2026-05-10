import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = JSON.parse(atob(token.split('.')[1]));
    if (decoded.role !== 'admin') return Response.json({ error: 'Akses ditolak' }, { status: 403 });

    const { seatId } = await request.json();
    const intSeatId = parseInt(seatId);
    const { data: seat } = await supabase.from('seats').select('id, status, locked_by').eq('id', intSeatId).single();

    if (!seat) return Response.json({ error: 'Kursi tidak ditemukan' }, { status: 404 });

    await supabase.from('seats')
      .update({ status: 'available', locked_by: null, lock_expires_at: null })
      .eq('id', intSeatId);

    if (seat.locked_by) {
      await supabase.from('reservations')
        .update({ status: 'cancelled', ended_at: new Date().toISOString() })
        .eq('seat_id', intSeatId).eq('user_id', seat.locked_by).in('status', ['active']);
    }

    return Response.json({ message: `Kursi ${intSeatId} berhasil dikosongkan` });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() { return Response.json({}); }