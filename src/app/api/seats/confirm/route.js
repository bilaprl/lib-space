import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Durasi dalam milidetik
const DURATION_MAP = {
  '1 Sesi (2 Jam)': 2 * 60 * 60 * 1000,
  '2 Sesi (4 Jam)': 4 * 60 * 60 * 1000,
  'Seharian (8 Jam)': 8 * 60 * 60 * 1000,
};

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const userId = decoded.id;

    const { seatIds, durationType } = await request.json();
    const intSeatIds = seatIds.map(id => parseInt(id));

    const durationMs = DURATION_MAP[durationType] || 2 * 60 * 60 * 1000;
    const startedAt = new Date();
    const endTime = new Date(startedAt.getTime() + durationMs);

    console.log('[CONFIRM] User:', userId, '| Seats:', intSeatIds, '| Duration:', durationType, '| End:', endTime.toISOString());

    // Update seats: set booked + end_time
    await supabase.from('seats')
      .update({ 
        status: 'booked', 
        lock_expires_at: endTime.toISOString() // Reuse kolom ini untuk end_time
      })
      .in('id', intSeatIds).eq('locked_by', userId);

    // Insert reservations
    const rows = intSeatIds.map((seatId) => ({
      user_id: userId, seat_id: seatId, status: 'active',
      duration_type: durationType, 
      started_at: startedAt.toISOString(),
    }));

    const { data, error } = await supabase.from('reservations').insert(rows).select();
    if (error) throw error;

    console.log('[CONFIRM] Success! End time:', endTime.toISOString());
    return Response.json({ message: 'Reservasi dikonfirmasi', reservations: data, endTime: endTime.toISOString() });
  } catch (err) {
    console.error('[CONFIRM] Error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() { return Response.json({}); }