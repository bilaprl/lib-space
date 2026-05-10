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

    // Gunakan WIB (UTC+7) untuk chart 7 hari terakhir
    const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const now = new Date();
      const nowWib = new Date(now.getTime() + WIB_OFFSET_MS);
      nowWib.setUTCDate(nowWib.getUTCDate() - i);
      const dateStr = nowWib.toISOString().split('T')[0];
      const dayName = new Date(dateStr + 'T00:00:00+07:00').toLocaleDateString('id-ID', { weekday: 'short', timeZone: 'Asia/Jakarta' });
      
      let dayHours = 0;
      for (const r of completedRes || []) {
        if (!r.started_at) continue;
        // Konversi started_at ke tanggal WIB
        const startWib = new Date(new Date(r.started_at).getTime() + WIB_OFFSET_MS);
        const startDateStr = startWib.toISOString().split('T')[0];
        if (startDateStr === dateStr) {
          if (r.started_at && r.ended_at) {
            const diffMs = new Date(r.ended_at) - new Date(r.started_at);
            if (diffMs < 60000) {
              if (r.duration_type?.includes('2 Jam')) dayHours += 2;
              else if (r.duration_type?.includes('4 Jam')) dayHours += 4;
              else if (r.duration_type?.includes('Seharian')) dayHours += 8;
              else dayHours += 2;
            } else {
              dayHours += diffMs / 3600000;
            }
          } else {
            if (r.duration_type?.includes('2 Jam')) dayHours += 2;
            else if (r.duration_type?.includes('4 Jam')) dayHours += 4;
            else if (r.duration_type?.includes('Seharian')) dayHours += 8;
            else dayHours += 2;
          }
        }
      }
      last7Days.push({ day: dayName, hours: Math.round(dayHours * 10) / 10 });
    }

    return Response.json({ totalHours: Math.round(totalHours), totalSessions: completedRes?.length || 0, favoriteSeat, favoriteType, last7Days });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() { return Response.json({}); }