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

    const { data: reservations } = await supabase
      .from('reservations').select('*')
      .eq('user_id', userId).order('created_at', { ascending: false });

    const seatIds = [...new Set((reservations || []).map(r => r.seat_id))];
    const { data: seatsData } = await supabase.from('seats').select('id, label, shape').in('id', seatIds);
    const seatsMap = {};
    (seatsData || []).forEach(s => { seatsMap[s.id] = s; });

    const statusMap = { active: 'Aktif', completed: 'Selesai', cancelled: 'Batal', expired: 'Kedaluwarsa' };

    const WIB_TZ = 'Asia/Jakarta';

    const history = (reservations || []).map(r => {
      const seat = seatsMap[r.seat_id] || {};
      let durationLabel = r.duration_type || '-';
      if (r.started_at && r.ended_at) {
        const diffMs = new Date(r.ended_at) - new Date(r.started_at);
        if (diffMs < 60000) {
          // Durasi sangat pendek (release cepat), tampilkan sesuai tipe yang dipilih
          if (r.duration_type?.includes('2 Jam')) durationLabel = '2 Jam';
          else if (r.duration_type?.includes('4 Jam')) durationLabel = '4 Jam';
          else if (r.duration_type?.includes('Seharian')) durationLabel = 'Seharian';
          else durationLabel = '2 Jam';
        } else {
          const hours = diffMs / 3600000;
          if (hours >= 1) {
            durationLabel = `${Math.round(hours)} Jam`;
          } else {
            durationLabel = `${Math.round(diffMs / 60000)} Menit`;
          }
        }
      } else if (r.duration_type) {
        // Reservasi masih aktif, tampilkan tipe durasi
        if (r.duration_type.includes('Seharian')) durationLabel = 'Seharian';
        else durationLabel = r.duration_type;
      }

      const startDate = new Date(r.started_at);
      const start = startDate.toLocaleTimeString('id-ID', { 
        hour: '2-digit', minute: '2-digit', timeZone: WIB_TZ 
      });
      const end = r.ended_at 
        ? new Date(r.ended_at).toLocaleTimeString('id-ID', { 
            hour: '2-digit', minute: '2-digit', timeZone: WIB_TZ 
          }) 
        : 'sekarang';

      return {
        id: `RES-${r.id.slice(0, 8).toUpperCase()}`,
        date: startDate.toLocaleDateString('id-ID', { 
          day: 'numeric', month: 'long', year: 'numeric', timeZone: WIB_TZ 
        }),
        time: `${start} - ${end}`,
        seat: seat.label || r.seat_id,
        type: seat.shape === 'circle' ? 'Bundar' : 'Meja',
        duration: durationLabel,
        status: statusMap[r.status] || r.status,
      };
    });

    return Response.json({ history });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() { return Response.json({}); }