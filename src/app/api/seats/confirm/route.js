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

    const { seatIds, durationType } = await request.json();
    // Normalize ke integer
    const intSeatIds = seatIds.map(id => parseInt(id));

    console.log('[CONFIRM] User:', userId, '| Seats:', intSeatIds, '| Duration:', durationType);

    await supabase.from('seats')
      .update({ status: 'booked', lock_expires_at: null })
      .in('id', intSeatIds).eq('locked_by', userId);

    const rows = intSeatIds.map((seatId) => ({
      user_id: userId, seat_id: seatId, status: 'active',
      duration_type: durationType, started_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('reservations').insert(rows).select();
    if (error) throw error;

    console.log('[CONFIRM] Success! Reservations:', data?.length);
    return Response.json({ message: 'Reservasi dikonfirmasi', reservations: data });
  } catch (err) {
    console.error('[CONFIRM] Error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() { return Response.json({}); }