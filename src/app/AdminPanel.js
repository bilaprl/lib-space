"use client";

const seatsConfig = [
  { id: "1", label: "1", shape: "square", x: "10.5%", y: "17%" },
  { id: "2", label: "2", shape: "square", x: "15.5%", y: "17%" },
  { id: "3", label: "3", shape: "square", x: "21%", y: "17%" },
  { id: "4", label: "4", shape: "square", x: "26%", y: "17%" },
  { id: "5", label: "5", shape: "square", x: "31.5%", y: "17%" },
  { id: "6", label: "6", shape: "square", x: "36.5%", y: "17%" },
  { id: "7", label: "7", shape: "square", x: "42%", y: "17%" },
  { id: "8", label: "8", shape: "square", x: "13%", y: "27.5%" },
  { id: "9", label: "9", shape: "square", x: "19.5%", y: "27.5%" },
  { id: "10", label: "10", shape: "square", x: "13%", y: "36%" },
  { id: "11", label: "11", shape: "square", x: "19.5%", y: "36%" },
  { id: "12", label: "12", shape: "square", x: "31%", y: "27.5%" },
  { id: "13", label: "13", shape: "square", x: "38%", y: "27.5%" },
  { id: "14", label: "14", shape: "square", x: "31%", y: "36%" },
  { id: "15", label: "15", shape: "square", x: "38%", y: "36%" },
  { id: "16", label: "16", shape: "square", x: "11.5%", y: "61.5%" },
  { id: "17", label: "17", shape: "square", x: "21.5%", y: "61.5%" },
  { id: "18", label: "18", shape: "square", x: "11.5%", y: "69.5%" },
  { id: "19", label: "19", shape: "square", x: "21.5%", y: "69.5%" },
  { id: "20", label: "20", shape: "square", x: "33.5%", y: "61.5%" },
  { id: "21", label: "21", shape: "square", x: "43.5%", y: "61.5%" },
  { id: "22", label: "22", shape: "square", x: "33.5%", y: "69.5%" },
  { id: "23", label: "23", shape: "square", x: "43.5%", y: "69.5%" },
  { id: "24", label: "24", shape: "square", x: "61.5%", y: "19%" },
  { id: "25", label: "25", shape: "square", x: "67.5%", y: "19%" },
  { id: "26", label: "26", shape: "square", x: "73%", y: "19%" },
  { id: "27", label: "27", shape: "square", x: "79%", y: "19%" },
  { id: "28", label: "28", shape: "square", x: "84.5%", y: "19%" },
  { id: "29", label: "29", shape: "square", x: "90%", y: "19%" },
  { id: "30", label: "30", shape: "square", x: "95.5%", y: "19%" },
  { id: "31", label: "31", shape: "square", x: "65.5%", y: "29.5%" },
  { id: "32", label: "32", shape: "square", x: "73.5%", y: "29.5%" },
  { id: "33", label: "33", shape: "square", x: "65.5%", y: "38%" },
  { id: "34", label: "34", shape: "square", x: "73.5%", y: "38%" },
  { id: "35", label: "35", shape: "square", x: "80%", y: "29.5%" },
  { id: "36", label: "36", shape: "square", x: "88%", y: "29.5%" },
  { id: "37", label: "37", shape: "square", x: "80%", y: "38%" },
  { id: "38", label: "38", shape: "square", x: "88%", y: "38%" },
  { id: "39", label: "39", shape: "square", x: "62%", y: "45.5%" },
  { id: "40", label: "40", shape: "square", x: "62%", y: "53.5%" },
  { id: "41", label: "41", shape: "square", x: "93%", y: "46.5%" },
  { id: "42", label: "42", shape: "square", x: "93%", y: "55.5%" },
  { id: "43", label: "43", shape: "circle", x: "73%", y: "48%" },
  { id: "44", label: "44", shape: "circle", x: "85.5%", y: "48%" },
  { id: "45", label: "45", shape: "circle", x: "73%", y: "61%" },
  { id: "46", label: "46", shape: "circle", x: "85.5%", y: "61%" },
  { id: "47", label: "47", shape: "circle", x: "73%", y: "71%" },
  { id: "48", label: "48", shape: "circle", x: "85.5%", y: "71%" },
  { id: "49", label: "49", shape: "circle", x: "73%", y: "82%" },
  { id: "50", label: "50", shape: "circle", x: "85.5%", y: "82%" },
];

export default function AdminPanel({
  seats,
  onRelease,
  onLogout,
  activeUsers,
}) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Admin (Disamakan dengan model dashboard) */}
      <nav className="flex-shrink-0 bg-white border-r border-slate-200 z-40 flex flex-col justify-between w-72 h-screen fixed shadow-[4px_0_24px_rgba(0,0,0,0.03)] transition-all duration-300">
        <div>
          <div className="flex items-center gap-3 px-8 h-24 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center lg:mr-4 flex-shrink-0 overflow-hidden">
            <img
              src="/logo.png"
              alt="Logo Unsil"
              className="w-full h-full object-contain"
            />
          </div>
            <div>
              <span className="font-black text-xl text-slate-900 tracking-tight block leading-none">
                LibSpace
              </span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                Resepsionis
              </span>
            </div>
          </div>

          <div className="px-4 py-6">
            <button className="w-full flex items-center gap-4 px-4 py-3.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200">
              <span className="material-symbols-outlined">monitoring</span> Live
              Monitoring
            </button>
          </div>
        </div>

        {/* Tombol Keluar dengan style yang sama seperti mahasiswa */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="flex items-center justify-start gap-3 w-full h-12 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all font-bold group px-4 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">
              logout
            </span>
            <span className="text-sm">Keluar Akun</span>
          </button>
        </div>
      </nav>

      {/* Konten Utama */}
      <main className="flex-1 ml-72 p-8 overflow-y-auto bg-slate-50 relative">
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <header className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                Monitor Perpustakaan
              </h2>
              <p className="text-slate-500 mt-1 font-medium">
                Pantau dan kelola penggunaan meja di ruang baca utama.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100 shadow-sm flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined text-[28px]">
                  groups
                </span>
              </div>
              <div>
                <div className="font-black text-3xl text-emerald-700 leading-none">
                  {activeUsers}
                </div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1">
                  Live Users
                </div>
              </div>
            </div>
          </header>

          {/* Mode Cepat Banner (Lebih ringkas dan elegan) */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 flex items-center gap-4 text-rose-700 shadow-sm animate-[fadeIn_0.3s_ease-out]">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-xl">
                ads_click
              </span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 leading-none mb-1">
                Mode Cepat Tersedia
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                Klik langsung pada kursi berwarna{" "}
                <b className="text-rose-600">merah</b> di peta bawah untuk
                mengosongkan tempat secara instan.
              </p>
            </div>
          </div>

          {/* BAGIAN PETA */}
          <section className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <h3 className="font-black text-2xl text-slate-900 tracking-tight mb-6">
              Visual Denah Real-time
            </h3>

            {/* LEGENDA PETA (Disamakan dengan Mahasiswa) */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 mb-8 border border-slate-200 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="material-symbols-outlined text-[20px]">
                  map
                </span>
                <span className="text-xs font-bold uppercase tracking-widest">
                  Legenda Peta:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-[10px] text-emerald-700 font-bold">
                    1
                  </div>
                  <span className="text-sm font-semibold text-slate-600">
                    Tersedia (Kosong)
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-rose-500 border-2 border-rose-600 flex items-center justify-center text-[10px] text-white font-bold">
                    1
                  </div>
                  <span className="text-sm font-semibold text-slate-600">
                    Terisi (Bisa Diklik/Kick)
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full overflow-x-auto pb-4">
              <div className="relative min-w-[800px] w-full max-w-[1200px] mx-auto select-none rounded-sm shadow-xl border-4 border-slate-200 overflow-hidden bg-white">
                <img
                  src="/map.png"
                  alt="Denah Perpustakaan"
                  className="w-full h-auto block pointer-events-none opacity-96 grayscale-[30%]"
                />

                {seats.map((seat) => {
                  const config = seatsConfig.find((s) => s.id === seat.id);
                  if (!config) return null;
                  const isBooked = seat.status === "booked";

                  // Styling base matching the aesthetic of the student page map
                  let baseClass = `absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-[10px] sm:text-[11px] font-black transition-all duration-300 z-30 border-2 shadow-[2px_3px_5px_rgba(0,0,0,0.4)] backdrop-blur-sm `;
                  if (config.shape === "circle")
                    baseClass += "w-[4%] aspect-square rounded-full ";
                  else baseClass += "w-[3.5%] aspect-square rounded-md ";

                  let statusClass = isBooked
                    ? "bg-rose-500/90 text-white border-rose-600 cursor-pointer hover:scale-110 hover:bg-rose-600 hover:shadow-[0_0_15px_rgba(225,29,72,0.6)] z-40"
                    : "bg-emerald-100/80 text-emerald-800 border-emerald-400 opacity80 pointer-events-none";

                  return (
                    <div
                      key={seat.id}
                      onClick={() => isBooked && onRelease(seat.id)}
                      className={baseClass + statusClass}
                      style={{ left: config.x, top: config.y }}
                      title={
                        isBooked
                          ? `Klik untuk KICK Kursi ${config.label}`
                          : `Kursi Kosong`
                      }
                    >
                      {config.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Bagian Bawah: Daftar Kursi (Sekarang lebih lega) */}
          <section className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <h3 className="font-black text-2xl text-slate-900 tracking-tight mb-6">
              Daftar Kursi Terisi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {seats
                .filter((s) => s.status === "booked")
                .map((seat) => (
                  <div
                    key={seat.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 flex items-center justify-center font-black text-lg">
                        {seat.id}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">
                          Mahasiswa
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Sedang Digunakan
                        </p>
                      </div>
                    </div>
                    {/* Styling tombol "KICK" disamakan dengan komponen Button di page mahasiswa */}
                    <button
                      onClick={() => onRelease(seat.id)}
                      className="px-4 py-2 text-xs font-bold text-rose-600 bg-white border-2 border-rose-200 rounded-xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        person_remove
                      </span>{" "}
                      Kick
                    </button>
                  </div>
                ))}
              {seats.filter((s) => s.status === "booked").length === 0 && (
                <p className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-slate-400 font-medium">
                  Belum ada kursi yang digunakan saat ini.
                </p>
              )}
            </div>
          </section>
          <footer className="mt-12 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400 w-full animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[14px] font-bold">
                  admin_panel_settings
                </span>
              </div>
              <span className="text-slate-700 font-black tracking-tight text-sm">
                LibSpace Admin{" "}
                <span className="font-semibold text-slate-400">
                  | Pusat Kontrol
                </span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <p>© 2026 Universitas Siliwangi. Hak Cipta Dilindungi.</p>
            </div>
          </footer>
        </div>
      </main>
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');`,
        }}
      />
    </div>
  );
}
