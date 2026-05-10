import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const userId = decoded.id;

    const { seatIds } = await request.json();
    // Normalize ke integer
    const intSeatIds = seatIds.map(id => parseInt(id));

    console.log('[RELEASE] User:', userId, '| Seats:', intSeatIds);

    await supabase.from('seats')
      .update({ status: 'available', locked_by: null, lock_expires_at: null })
      .in('id', intSeatIds).eq('locked_by', userId);

    await supabase.from('reservations')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .in('seat_id', intSeatIds).eq('user_id', userId).eq('status', 'active');

    console.log('[RELEASE] Success!');
    return Response.json({ message: 'Kursi berhasil dilepas' });
  } catch (err) {
    console.error('[RELEASE] Error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() { return Response.json({}); }