import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DURATION_MAP = {
  '1 Sesi (2 Jam)': 2 * 60 * 60 * 1000,
  '2 Sesi (4 Jam)': 4 * 60 * 60 * 1000,
};

// Jam operasional perpustakaan: 08:00 - 16:00 WIB
// Hitung durasi "Seharian" = sampai jam tutup perpustakaan (16:00 WIB)
function getSeharianDurationMs(startTime) {
  // Dapatkan tanggal hari ini dalam WIB
  const wibDateStr = startTime.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD
  
  // Buat target jam tutup: 16:00 WIB (menggunakan offset +07:00 agar akurat)
  const closingTime = new Date(`${wibDateStr}T16:00:00+07:00`);
  
  const diffMs = closingTime.getTime() - startTime.getTime();
  
  // Jika sudah lewat jam tutup atau kurang dari 30 menit, set minimum 30 menit
  if (diffMs < 30 * 60 * 1000) {
    return 30 * 60 * 1000;
  }
  
  return diffMs;
}

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const userId = decoded.id;

    const { seatIds, durationType } = await request.json();
    const intSeatIds = seatIds.map(id => parseInt(id));

    const startedAt = new Date();
    
    let durationMs;
    if (durationType === 'Seharian (Sampai Tutup)') {
      durationMs = getSeharianDurationMs(startedAt);
    } else {
      durationMs = DURATION_MAP[durationType] || 2 * 60 * 60 * 1000;
    }
    
    const endTime = new Date(startedAt.getTime() + durationMs);

    await supabase.from('seats')
      .update({ 
        status: 'booked', 
        lock_expires_at: endTime.toISOString()
      })
      .in('id', intSeatIds).eq('locked_by', userId);

    const rows = intSeatIds.map((seatId) => ({
      user_id: userId, seat_id: seatId, status: 'active',
      duration_type: durationType, 
      started_at: startedAt.toISOString(),
    }));

    const { data, error } = await supabase.from('reservations').insert(rows).select();
    if (error) throw error;

    return Response.json({ message: 'Reservasi dikonfirmasi', reservations: data, endTime: endTime.toISOString() });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() { return Response.json({}); }