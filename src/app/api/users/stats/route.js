import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const userId = decoded.id;

    const { data: completedRes } = await supabase
      .from('reservations').select('started_at, ended_at, seat_id, duration_type')
      .eq('user_id', userId).eq('status', 'completed');

    let totalHours = 0;
    const seatFreq = {};
    for (const r of completedRes || []) {
      if (r.started_at && r.ended_at) {
        const diffMs = new Date(r.ended_at) - new Date(r.started_at);
        if (diffMs < 60000) {
          if (r.duration_type?.includes('2 Jam')) totalHours += 2;
          else if (r.duration_type?.includes('4 Jam')) totalHours += 4;
          else if (r.duration_type?.includes('Seharian')) totalHours += 8;
          else totalHours += 2;
        } else totalHours += diffMs / 3600000;
      }
      if (r.seat_id) seatFreq[r.seat_id] = (seatFreq[r.seat_id] || 0) + 1;
    }

    let favoriteSeat = '-', favoriteType = 'Meja', maxCount = 0;
    for (const [seatId, count] of Object.entries(seatFreq)) {
      if (count > maxCount) { maxCount = count; favoriteSeat = seatId; }
    }
    if (favoriteSeat !== '-') {
      const { data: sd } = await supabase.from('seats').select('label, shape').eq('id', favoriteSeat).single();
      if (sd) { favoriteSeat = sd.label; favoriteType = sd.shape === 'circle' ? 'Bundar' : 'Meja'; }
    }

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
      let dayHours = 0;
      for (const r of completedRes || []) {
        if (r.started_at?.startsWith(dateStr)) {
          if (r.duration_type?.includes('2 Jam')) dayHours += 2;
          else if (r.duration_type?.includes('4 Jam')) dayHours += 4;
          else if (r.duration_type?.includes('Seharian')) dayHours += 8;
          else dayHours += 2;
        }
      }
      last7Days.push({ day: dayName, hours: dayHours });
    }

    return Response.json({ totalHours: Math.round(totalHours), totalSessions: completedRes?.length || 0, favoriteSeat, favoriteType, last7Days });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() { return Response.json({}); }