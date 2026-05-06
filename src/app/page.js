"use client";

import { useState, useEffect, useRef } from "react";
import AdminPanel from "./AdminPanel";

// ==========================================
// 1. KONFIGURASI TATA LETAK OVERLAY PETA
// ==========================================
const seatsConfig = [
  // Meja Panjang Kiri (Atas) - 1 sampai 7
  { id: "1", label: "1", shape: "square", x: "10.5%", y: "17%" },
  { id: "2", label: "2", shape: "square", x: "15.5%", y: "17%" },
  { id: "3", label: "3", shape: "square", x: "21%", y: "17%" },
  { id: "4", label: "4", shape: "square", x: "26%", y: "17%" },
  { id: "5", label: "5", shape: "square", x: "31.5%", y: "17%" },
  { id: "6", label: "6", shape: "square", x: "36.5%", y: "17%" },
  { id: "7", label: "7", shape: "square", x: "42%", y: "17%" },

  // Cross Kiri 1
  { id: "8", label: "8", shape: "square", x: "13%", y: "27.5%" },
  { id: "9", label: "9", shape: "square", x: "19.5%", y: "27.5%" },
  { id: "10", label: "10", shape: "square", x: "13%", y: "36%" },
  { id: "11", label: "11", shape: "square", x: "19.5%", y: "36%" },

  // Cross Kiri 2
  { id: "12", label: "12", shape: "square", x: "31%", y: "27.5%" },
  { id: "13", label: "13", shape: "square", x: "38%", y: "27.5%" },
  { id: "14", label: "14", shape: "square", x: "31%", y: "36%" },
  { id: "15", label: "15", shape: "square", x: "38%", y: "36%" },

  // Meja Kelompok (Kiri Bawah) - Total 8 Kursi
  { id: "16", label: "16", shape: "square", x: "11.5%", y: "61.5%" }, // Kiri Atas
  { id: "17", label: "17", shape: "square", x: "21.5%", y: "61.5%" }, // Kanan Atas
  { id: "18", label: "18", shape: "square", x: "11.5%", y: "69.5%" }, // Kiri Bawah
  { id: "19", label: "19", shape: "square", x: "21.5%", y: "69.5%" }, // Kanan Bawah
  { id: "20", label: "20", shape: "square", x: "33.5%", y: "61.5%" }, // Kiri Atas
  { id: "21", label: "21", shape: "square", x: "43.5%", y: "61.5%" }, // Kanan Atas
  { id: "22", label: "22", shape: "square", x: "33.5%", y: "69.5%" }, // Kiri Bawah
  { id: "23", label: "23", shape: "square", x: "43.5%", y: "69.5%" }, // Kanan Bawah

  // Meja Panjang Kanan (Atas) - 24 sampai 30
  { id: "24", label: "24", shape: "square", x: "61.5%", y: "19%" },
  { id: "25", label: "25", shape: "square", x: "67.5%", y: "19%" },
  { id: "26", label: "26", shape: "square", x: "73%", y: "19%" },
  { id: "27", label: "27", shape: "square", x: "79%", y: "19%" },
  { id: "28", label: "28", shape: "square", x: "84.5%", y: "19%" },
  { id: "29", label: "29", shape: "square", x: "90%", y: "19%" },
  { id: "30", label: "30", shape: "square", x: "95.5%", y: "19%" },

  // Cross Kanan 1
  { id: "31", label: "31", shape: "square", x: "65.5%", y: "29.5%" },
  { id: "32", label: "32", shape: "square", x: "73.5%", y: "29.5%" },
  { id: "33", label: "33", shape: "square", x: "65.5%", y: "38%" },
  { id: "34", label: "34", shape: "square", x: "73.5%", y: "38%" },

  // Cross Kanan 2
  { id: "35", label: "35", shape: "square", x: "80%", y: "29.5%" },
  { id: "36", label: "36", shape: "square", x: "88%", y: "29.5%" },
  { id: "37", label: "37", shape: "square", x: "80%", y: "38%" },
  { id: "38", label: "38", shape: "square", x: "88%", y: "38%" },

  // Meja Lesehan Vertikal Tengah
  { id: "39", label: "39", shape: "square", x: "62%", y: "45.5%" },
  { id: "40", label: "40", shape: "square", x: "62%", y: "53.5%" },

  // Meja Lesehan Vertikal Kanan
  { id: "41", label: "41", shape: "square", x: "93%", y: "46.5%" },
  { id: "42", label: "42", shape: "square", x: "93%", y: "55.5%" },

  // Meja Bundar Atas
  { id: "43", label: "43", shape: "circle", x: "73%", y: "48%" },
  { id: "44", label: "44", shape: "circle", x: "85.5%", y: "48%" },
  { id: "45", label: "45", shape: "circle", x: "73%", y: "61%" },
  { id: "46", label: "46", shape: "circle", x: "85.5%", y: "61%" },

  // Meja Bundar Bawah
  { id: "47", label: "47", shape: "circle", x: "73%", y: "71%" },
  { id: "48", label: "48", shape: "circle", x: "85.5%", y: "71%" },
  { id: "49", label: "49", shape: "circle", x: "73%", y: "82%" },
  { id: "50", label: "50", shape: "circle", x: "85.5%", y: "82%" },
];

const generateStaticSeats = () => {
  return seatsConfig.map((seat) => ({
    id: seat.id,
    status: "available",
  }));
};

const randomizeSeatsForClient = (baseSeats) => {
  return baseSeats.map((seat) => ({
    ...seat,
    status: Math.random() > 0.45 ? "available" : "booked",
  }));
};

// ==========================================
// 2. MOCK DATA UNTUK RIWAYAT & STATISTIK
// ==========================================
const mockHistory = [
  {
    id: "RES-9821",
    date: "4 Mei 2026",
    time: "13:00 - 15:00",
    seat: "16",
    type: "Lesehan",
    duration: "2 Jam",
    status: "Selesai",
  },
  {
    id: "RES-9754",
    date: "2 Mei 2026",
    time: "09:00 - 13:00",
    seat: "42",
    type: "Bundar",
    duration: "4 Jam",
    status: "Selesai",
  },
  {
    id: "RES-9602",
    date: "28 Apr 2026",
    time: "14:00 - 16:00",
    seat: "8",
    type: "Cross",
    duration: "2 Jam",
    status: "Batal",
  },
  {
    id: "RES-9511",
    date: "25 Apr 2026",
    time: "10:00 - 14:00",
    seat: "16",
    type: "Lesehan",
    duration: "4 Jam",
    status: "Selesai",
  },
  {
    id: "RES-9320",
    date: "20 Apr 2026",
    time: "15:00 - 17:00",
    seat: "24",
    type: "Panjang",
    duration: "2 Jam",
    status: "Selesai",
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("mahasiswa");
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Navigasi Tabs: "map", "history", "stats"
  const [activeTab, setActiveTab] = useState("map");

  const [seats, setSeats] = useState(generateStaticSeats());
  const [myBookedSeats, setMyBookedSeats] = useState([]);
  const [pendingSeats, setPendingSeats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState(42);

  const stateRefs = useRef({ myBookedSeats, pendingSeats });

  useEffect(() => {
    stateRefs.current = { myBookedSeats, pendingSeats };
  }, [myBookedSeats, pendingSeats]);

  // =========================================================================
  // FITUR BARU: AUTO-RELEASE KETIKA 5 MENIT PENDING TANPA KONFIRMASI
  // =========================================================================
  useEffect(() => {
    let timeoutId;

    if (pendingSeats.length > 0) {
      // Set timer selama 5 Menit (300.000 ms)
      timeoutId = setTimeout(() => {
        setSeats((prev) =>
          prev.map((s) =>
            pendingSeats.includes(s.id) ? { ...s, status: "available" } : s,
          ),
        );
        setPendingSeats([]);
        setIsModalOpen(false);
        alert(
          "Waktu pemilihan habis (5 menit). Kursi yang Anda pilih telah dilepaskan kembali oleh sistem.",
        );
      }, 300000);
    }

    // Bersihkan timer jika user merubah pilihan sebelum 5 menit habis
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pendingSeats]);
  // =========================================================================

  useEffect(() => {
    setMounted(true);
    setSeats(randomizeSeatsForClient(generateStaticSeats()));

    const interval = setInterval(() => {
      setActiveUsers((prev) =>
        Math.max(20, Math.min(85, prev + (Math.random() > 0.5 ? 2 : -2))),
      );
      setSeats((prevSeats) => {
        const newSeats = [...prevSeats];
        const randomIdx = Math.floor(Math.random() * newSeats.length);
        const randomSeat = { ...newSeats[randomIdx] };
        const { myBookedSeats: currentMySeats, pendingSeats: currentPending } =
          stateRefs.current;

        if (
          !currentMySeats.includes(randomSeat.id) &&
          !currentPending.includes(randomSeat.id)
        ) {
          if (randomSeat.status === "available" && Math.random() > 0.7) {
            randomSeat.status = "booking";
            setTimeout(() => {
              setSeats((currSeats) =>
                currSeats.map((s) =>
                  s.id === randomSeat.id && s.status === "booking"
                    ? {
                        ...s,
                        status: Math.random() > 0.3 ? "booked" : "available",
                      }
                    : s,
                ),
              );
            }, 2500);
          } else if (randomSeat.status === "booked" && Math.random() > 0.8) {
            randomSeat.status = "available";
          }
        }
        newSeats[randomIdx] = randomSeat;
        return newSeats;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const availableCount = seats.filter((s) => s.status === "available").length;

  const handleAuth = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      if (loginForm.identifier.toLowerCase().includes("admin")) {
        setUserRole("admin");
      } else {
        setUserRole("mahasiswa");
      }
      setIsLoggedIn(true);
      setIsLoggingIn(false);
    }, 1500);
  };

  const adminForceRelease = (seatId) => {
    setSeats((prev) =>
      prev.map((s) => (s.id === seatId ? { ...s, status: "available" } : s)),
    );
  };

  const handleSeatClick = (seatId) => {
    if (activeTab !== "map") return;

    const seat = seats.find((s) => s.id === seatId);

    if (myBookedSeats.length > 0) {
      alert(
        "Anda sudah memiliki reservasi aktif. Selesaikan atau tinggalkan kursi Anda saat ini terlebih dahulu.",
      );
      return;
    }
    if (seat.status === "booked") return;

    if (seat.status === "available") {
      if (pendingSeats.length >= 3) {
        alert("Maksimal pemesanan dalam satu waktu adalah 3 kursi.");
        return;
      }
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: "booking" } : s)),
      );
      setPendingSeats((prev) => [...prev, seatId]);
    } else if (seat.status === "booking" && pendingSeats.includes(seatId)) {
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: "available" } : s)),
      );
      setPendingSeats((prev) => prev.filter((id) => id !== seatId));
    }
  };

  const cancelAllPending = () => {
    setSeats((prev) =>
      prev.map((s) =>
        pendingSeats.includes(s.id) ? { ...s, status: "available" } : s,
      ),
    );
    setPendingSeats([]);
    setIsModalOpen(false);
  };

  const confirmBooking = () => {
    setSeats((prev) =>
      prev.map((s) =>
        pendingSeats.includes(s.id) ? { ...s, status: "booked" } : s,
      ),
    );
    setMyBookedSeats(pendingSeats);
    setPendingSeats([]);
    setIsModalOpen(false);
  };

  const releaseMySeats = () => {
    setSeats((prev) =>
      prev.map((s) =>
        myBookedSeats.includes(s.id) ? { ...s, status: "available" } : s,
      ),
    );
    setMyBookedSeats([]);
  };

  if (!mounted) return null;

  if (userRole === "admin") {
    return (
      <AdminPanel
        seats={seats}
        onRelease={adminForceRelease}
        onLogout={() => {
          setIsLoggedIn(false);
          setUserRole("mahasiswa");
        }}
        activeUsers={activeUsers}
      />
    );
  }

  // ==========================================
  // LAYAR LOGIN (TEMA PUTIH & HIJAU - FULL BACKGROUND)
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-emerald-950 font-sans overflow-hidden">
        {/* Background Foto Full Layar */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              "url('https://assets.radartasik.id/main/2024/04/perpus-unsil.webp')",
          }}
        ></div>

        {/* Overlay Hijau & Blur agar foto tidak terlalu jelas dan tulisan mudah dibaca */}
        <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-[6px] z-0"></div>

        {/* Kontainer Utama (Teks Kiri & Form Kanan) */}
        <div className="w-full max-w-7xl z-10 flex flex-col lg:flex-row items-center justify-between gap-12 px-6 py-12 lg:px-12">
          {/* KIRI: Teks & Informasi */}
          <div className="w-full lg:w-1/2 text-left flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/30 bg-emerald-900/50 backdrop-blur-md mb-6 w-fit shadow-lg">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-50 tracking-[0.2em] uppercase">
                Sistem Reservasi Real-time
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight drop-shadow-xl">
              LibSpace<span className="text-yellow-400">.</span>
            </h1>

            <p className="text-lg lg:text-xl text-emerald-100/90 leading-relaxed max-w-md font-medium drop-shadow-md">
              Eksplorasi tata letak perpustakaan, pantau ketersediaan kursi, dan
              amankan tempat belajarmu di Universitas Siliwangi hanya dalam
              hitungan detik.
            </p>
          </div>

          {/* KANAN: Kotak Form Login Putih Bersih */}
          <div className="w-full lg:w-[45%] max-w-md">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden border border-emerald-50">
              <div className="mb-8">
                {/* === UBAH LOGO DI SINI (Halaman Login) === */}
                {/* Mengganti icon bank dengan foto logo Unsil */}
                <div className="w-16 h-16 bg-white border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm mb-6 overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="Logo Unsil"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                {/* ========================================= */}
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  Selamat Datang
                </h2>
                <p className="text-slate-500 font-medium text-sm">
                  Masuk dengan kredensial Siliwangi Anda untuk melanjutkan.
                </p>
              </div>

              <button
                onClick={handleAuth}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-sm mb-6 group"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                />
                Masuk menggunakan Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Atau Manual
                </span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="NPM / Email Universitas"
                    value={loginForm.identifier}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, identifier: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    required
                    placeholder="Kata Sandi"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black py-4 px-6 rounded-2xl shadow-[0_10px_20px_rgba(5,150,105,0.2)] transition-all mt-6 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoggingIn ? (
                    <span className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    "MASUK SEKARANG"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD DENGAN SIDEBAR LENGKAP
  // ==========================================
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* --- SIDEBAR TERANG (Aksen Hijau) --- */}
      <nav className="flex-shrink-0 bg-white border-r border-slate-200 z-40 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-stretch sm:w-24 lg:w-72 h-20 sm:h-screen w-full fixed sm:relative bottom-0 sm:bottom-auto order-last sm:order-first shadow-[0_-4px_20px_rgba(0,0,0,0.03)] sm:shadow-[4px_0_24px_rgba(0,0,0,0.03)] transition-all duration-300">
        <div className="flex items-center justify-center lg:justify-start lg:px-8 h-20 sm:h-24 sm:border-b border-slate-100 w-auto sm:w-full ml-4 sm:ml-0 flex-shrink-0">
          {/* === UBAH LOGO DI SINI (Sidebar Mahasiswa) === */}
          {/* Mengganti background hijau dan icon bank dengan foto logo Unsil */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center lg:mr-4 flex-shrink-0 overflow-hidden">
            <img
              src="/logo.png"
              alt="Logo Unsil"
              className="w-full h-full object-contain"
            />
          </div>
          {/* ============================================= */}

          <div className="hidden lg:block">
            <span className="font-black text-xl text-slate-900 tracking-tight block leading-none">
              LibSpace
            </span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              Univ. Siliwangi
            </span>
          </div>
        </div>

        {/* Menu Navigasi Utama */}
        <div className="flex-1 flex sm:flex-col items-center sm:items-stretch justify-center sm:justify-start lg:px-4 sm:py-6 gap-2 sm:gap-4 overflow-y-auto w-full">
          <button
            onClick={() => setActiveTab("map")}
            className={`flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-4 px-2 lg:px-4 py-2 lg:py-3.5 rounded-xl transition-all w-16 lg:w-full border ${activeTab === "map" ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"}`}
          >
            <span className="material-symbols-outlined text-[24px]">
              grid_view
            </span>
            <span className="text-[10px] lg:text-sm hidden sm:block">
              Dashboard Peta
            </span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-4 px-2 lg:px-4 py-2 lg:py-3.5 rounded-xl transition-all w-16 lg:w-full border ${activeTab === "history" ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"}`}
          >
            <span className="material-symbols-outlined text-[24px]">
              history
            </span>
            <span className="text-[10px] lg:text-sm hidden sm:block">
              Riwayat Reservasi
            </span>
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`flex flex-col lg:flex-row items-center lg:justify-start gap-1 lg:gap-4 px-2 lg:px-4 py-2 lg:py-3.5 rounded-xl transition-all w-16 lg:w-full border ${activeTab === "stats" ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"}`}
          >
            <span className="material-symbols-outlined text-[24px]">
              analytics
            </span>
            <span className="text-[10px] lg:text-sm hidden sm:block">
              Statistik Belajar
            </span>
          </button>

          <div className="hidden sm:block w-full h-px bg-slate-100 my-2"></div>
        </div>

        {/* Profil & Logout Area Bawah */}
        <div className="flex sm:flex-col items-center justify-center lg:justify-start h-20 sm:h-auto sm:pb-6 w-auto sm:w-full mr-4 sm:mr-0 flex-shrink-0 lg:px-4 gap-4">
          {/* User Widget */}
          <div className="hidden sm:flex items-center bg-slate-50 p-3 lg:px-4 lg:py-3 rounded-2xl border border-slate-200 shadow-sm gap-3 w-full mb-1">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border border-slate-300">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Nabila`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">
                Nabila Aprilianti N.
              </p>
            </div>
          </div>

          {/* Widget Live User */}
          <div className="hidden sm:flex items-center justify-center bg-emerald-50 p-2 lg:py-2 rounded-xl border border-emerald-100 gap-2 w-full mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
            </span>
            <span className="text-xs font-bold text-emerald-700">
              <span className="text-emerald-800">{activeUsers}</span> Online
            </span>
          </div>

          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center justify-center lg:justify-start gap-3 w-10 h-10 sm:w-12 sm:h-12 lg:w-full lg:h-12 rounded-xl bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-all font-bold group lg:px-4"
          >
            <span className="material-symbols-outlined text-[20px] lg:group-hover:-translate-x-1 transition-transform">
              logout
            </span>
            <span className="hidden lg:block text-sm">Keluar Akun</span>
          </button>
        </div>
      </nav>

      {/* --- AREA KONTEN UTAMA --- */}
      <div className="flex-1 overflow-y-auto h-screen relative bg-slate-50 pb-24 sm:pb-0">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 flex flex-col gap-8">
          {/* TAB: PETA (DEFAULT) */}
          {activeTab === "map" && (
            <>
              {/* TIKET AKTIF */}
              {myBookedSeats.length > 0 && (
                <div className="bg-emerald-800 rounded-3xl shadow-2xl relative overflow-hidden border border-emerald-700 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-[fadeIn_0.5s_ease-out]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative z-10 w-full md:w-auto">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-300 text-4xl">
                        confirmation_number
                      </span>
                      <div>
                        <h2 className="font-bold text-xl text-white leading-tight">
                          Tiket Aktifmu
                        </h2>
                        <span className="text-xs text-emerald-200">
                          Sedang Digunakan
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:block w-px h-10 bg-emerald-600"></div>
                    <div className="flex flex-wrap gap-2">
                      {myBookedSeats.map((id) => {
                        const labelId =
                          seatsConfig.find((s) => s.id === id)?.label || id;
                        return (
                          <span
                            key={id}
                            className="bg-white text-emerald-800 px-5 py-2.5 rounded-xl font-black shadow-lg text-lg"
                          >
                            {labelId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={releaseMySeats}
                    className="w-full md:w-auto px-6 py-4 text-sm font-bold text-rose-100 bg-rose-500/20 border border-rose-500/30 rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 relative z-10 flex-shrink-0"
                  >
                    Selesai Belajar
                  </button>
                </div>
              )}

              <section className="w-full animate-[fadeIn_0.3s_ease-out]">
                <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <h2 className="font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
                        Denah Interaktif
                      </h2>
                      <p className="text-slate-500 mt-2 font-medium">
                        Klik kursi pada peta di bawah ini untuk mengamankan
                        tempatmu.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100 flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined text-[28px]">
                          event_seat
                        </span>
                      </div>
                      <div>
                        <div className="font-black text-3xl text-emerald-700 leading-none">
                          {availableCount}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1">
                          Tersedia
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LEGENDA PETA */}
                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 mb-8 border border-slate-200 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="material-symbols-outlined text-[20px]">
                        map
                      </span>
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Legenda Peta:
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-emerald-400 border-2 border-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">
                          1
                        </div>
                        <span className="text-sm font-semibold text-slate-600">
                          Tersedia
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-[10px] text-emerald-700 font-bold">
                          1
                        </div>
                        <span className="text-sm font-semibold text-slate-600">
                          Dipilih
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-rose-500 border-2 border-rose-600 flex items-center justify-center text-[10px] text-white font-bold">
                          1
                        </div>
                        <span className="text-sm font-semibold text-slate-600">
                          Terisi
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-emerald-700 border-2 border-emerald-600 ring-2 ring-emerald-400/50 flex items-center justify-center text-[10px] text-white font-bold">
                          1
                        </div>
                        <span className="text-sm font-semibold text-slate-600">
                          Posisi Anda
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* === CANVAS GAMBAR PETA ASLI === */}
                  <div className="w-full overflow-x-auto pb-4">
                    <div className="relative min-w-[800px] w-full max-w-[1200px] mx-auto select-none rounded-sm shadow-xl border-4 border-slate-200 overflow-hidden bg-white">
                      <img
                        src="/map.png"
                        alt="Denah Perpustakaan"
                        className="w-full h-auto block pointer-events-none"
                      />

                      {seats.map((seat) => {
                        const config = seatsConfig.find(
                          (s) => s.id === seat.id,
                        );
                        if (!config) return null;

                        const isPending = pendingSeats.includes(seat.id);
                        const isMyBooked = myBookedSeats.includes(seat.id);

                        let baseClass = `absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-[10px] sm:text-[11px] font-black transition-all duration-300 z-30 border-2 shadow-[2px_3px_5px_rgba(0,0,0,0.4)] backdrop-blur-sm `;
                        if (config.shape === "circle")
                          baseClass += "w-[4%] aspect-square rounded-full ";
                        else baseClass += "w-[3.5%] aspect-square rounded-md ";

                        let statusClass = "";
                        if (isMyBooked)
                          statusClass =
                            "bg-emerald-700 text-white border-emerald-600 ring-4 ring-emerald-400/50 shadow-[0_0_20px_rgba(4,120,87,0.8)] scale-110 z-40 cursor-not-allowed";
                        else if (isPending)
                          statusClass =
                            "bg-emerald-100 text-emerald-800 border-emerald-400 ring-4 ring-emerald-300/50 scale-110 cursor-pointer shadow-2xl z-40";
                        else if (seat.status === "booking")
                          statusClass =
                            "bg-slate-300 text-slate-600 border-slate-400 animate-pulse cursor-not-allowed";
                        else if (seat.status === "booked")
                          statusClass =
                            "bg-rose-500/90 text-white border-rose-600 cursor-not-allowed";
                        else if (seat.status === "available")
                          statusClass =
                            "bg-emerald-400/80 text-white border-emerald-500 hover:scale-105 hover:bg-emerald-500 cursor-pointer hover:shadow-md hover:shadow-emerald-500/40 hover:z-40";

                        return (
                          <div
                            key={seat.id}
                            onClick={() => handleSeatClick(seat.id)}
                            className={baseClass + statusClass}
                            style={{ left: config.x, top: config.y }}
                            title={
                              isMyBooked
                                ? "Kursi Anda"
                                : `Pilih Kursi ${config.label}`
                            }
                          >
                            {config.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* TAB: RIWAYAT RESERVASI */}
          {activeTab === "history" && (
            <section className="w-full animate-[fadeIn_0.3s_ease-out]">
              <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="mb-8">
                  <h2 className="font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
                    Riwayat Reservasi
                  </h2>
                  <p className="text-slate-500 mt-2 font-medium">
                    Catatan lengkap aktivitas peminjaman kursimu di LibSpace.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-100">
                        <th className="pb-4 pt-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          ID Reservasi
                        </th>
                        <th className="pb-4 pt-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Waktu
                        </th>
                        <th className="pb-4 pt-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Nomor Kursi
                        </th>
                        <th className="pb-4 pt-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Durasi
                        </th>
                        <th className="pb-4 pt-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockHistory.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-50 hover:bg-emerald-50/50 transition-colors group"
                        >
                          <td className="py-5 px-4 font-bold text-slate-900">
                            {item.id}
                          </td>
                          <td className="py-5 px-4">
                            <span className="block font-semibold text-slate-800">
                              {item.date}
                            </span>
                            <span className="block text-xs text-slate-500 mt-0.5">
                              {item.time}
                            </span>
                          </td>
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                                {item.seat}
                              </div>
                              <span className="text-sm font-semibold text-slate-600">
                                {item.type}
                              </span>
                            </div>
                          </td>
                          <td className="py-5 px-4 font-semibold text-slate-700">
                            {item.duration}
                          </td>
                          <td className="py-5 px-4 text-right">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${item.status === "Selesai" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB: STATISTIK BELAJAR */}
          {activeTab === "stats" && (
            <section className="w-full animate-[fadeIn_0.3s_ease-out] flex flex-col gap-6">
              <div className="mb-2">
                <h2 className="font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
                  Statistik Belajar
                </h2>
                <p className="text-slate-500 mt-2 font-medium">
                  Pantau terus produktivitas belajarmu di perpustakaan.
                </p>
              </div>

              {/* Top Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <span className="material-symbols-outlined text-[32px]">
                      schedule
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Total Waktu Belajar
                    </div>
                    <div className="text-3xl font-black text-slate-900 leading-none">
                      52{" "}
                      <span className="text-lg font-bold text-slate-500">
                        Jam
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                    <span className="material-symbols-outlined text-[32px]">
                      check_circle
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Total Kunjungan
                    </div>
                    <div className="text-3xl font-black text-slate-900 leading-none">
                      18{" "}
                      <span className="text-lg font-bold text-slate-500">
                        Sesi
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                    <span className="material-symbols-outlined text-[32px]">
                      star
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Kursi Favorit
                    </div>
                    <div className="text-3xl font-black text-slate-900 leading-none">
                      16{" "}
                      <span className="text-lg font-bold text-slate-500">
                        Lesehan
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 mt-2">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">
                      Aktivitas 7 Hari Terakhir
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Berdasarkan durasi reservasi harian
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-700">
                    Mei 2026
                  </div>
                </div>

                {/* CSS Simple Bar Chart */}
                <div className="flex items-end justify-between h-48 gap-2 sm:gap-6 mt-6 pb-2 border-b border-slate-100">
                  {[
                    { day: "Sen", val: "40%" },
                    { day: "Sel", val: "80%" },
                    { day: "Rab", val: "60%" },
                    { day: "Kam", val: "30%" },
                    { day: "Jum", val: "90%" },
                    { day: "Sab", val: "20%" },
                    { day: "Min", val: "50%" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center flex-1 group"
                    >
                      <div className="w-full max-w-[40px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end relative h-full">
                        <div
                          className="w-full bg-emerald-400 group-hover:bg-emerald-500 transition-all rounded-t-xl"
                          style={{ height: item.val }}
                        ></div>
                      </div>
                      <span className="mt-4 text-xs font-bold text-slate-400">
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ========================================== */}
          {/* FOOTER MAHASISWA (TAMBAHKAN DI SINI) */}
          {/* ========================================== */}
          <footer className="mt-8 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400 w-full animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[14px] font-bold">
                  account_balance
                </span>
              </div>
              <span className="text-slate-700 font-black tracking-tight text-sm">
                LibSpace{" "}
                <span className="font-semibold text-slate-400">
                  | Univ. Siliwangi
                </span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <p>© 2026 Sistem Reservasi Real-time.</p>
            </div>
          </footer>
        </main>
      </div>

      {/* FLOATING ACTION BAR & MODALS (Hanya Muncul di Peta) */}
      {activeTab === "map" && pendingSeats.length > 0 && !isModalOpen && (
        <div className="fixed bottom-28 sm:bottom-10 left-1/2 -translate-x-1/2 sm:left-auto sm:-translate-x-0 sm:right-10 bg-white border border-slate-200 p-2.5 pl-8 pr-2.5 rounded-full shadow-2xl flex items-center gap-8 z-50 animate-[bounce_1s_ease-in-out_infinite]">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm">
              {pendingSeats.length}
            </div>
            <span className="font-bold text-sm text-slate-700 tracking-wide hidden sm:block">
              Kursi Dipilih
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-full font-black text-sm transition-all shadow-[0_5px_15px_rgba(5,150,105,0.3)] flex items-center gap-2 hover:scale-105"
          >
            Checkout{" "}
            <span className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
          </button>
        </div>
      )}

      {activeTab === "map" && isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={cancelAllPending}
          ></div>
          <div className="bg-white rounded-[2rem] shadow-2xl z-10 w-full max-w-md overflow-hidden transform transition-all scale-100 border border-slate-100 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-emerald-800 px-8 py-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
              <h3 className="font-black text-xl text-white relative z-10">
                Konfirmasi Tiket
              </h3>
              <button
                onClick={cancelAllPending}
                className="text-emerald-200 hover:text-white hover:bg-white/10 p-2 rounded-full transition relative z-10"
              >
                <span className="material-symbols-outlined block">close</span>
              </button>
            </div>
            <div className="p-8">
              <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Rangkuman Pesanan
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-bold">Jumlah Kursi</span>
                  <span className="font-black text-slate-900 text-xl">
                    {pendingSeats.length}{" "}
                    <span className="text-sm font-semibold text-slate-500">
                      Kursi
                    </span>
                  </span>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {pendingSeats.map((id) => {
                    const labelId =
                      seatsConfig.find((s) => s.id === id)?.label || id;
                    return (
                      <span
                        key={id}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-xl font-black text-sm shadow-sm"
                      >
                        {labelId}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="mb-8">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Pilih Durasi Peminjaman
                </label>
                <select className="w-full bg-white border-2 border-slate-200 text-slate-800 rounded-2xl font-bold focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 block p-4 outline-none transition cursor-pointer appearance-none shadow-sm">
                  <option>1 Sesi (2 Jam)</option>
                  <option>2 Sesi (4 Jam)</option>
                  <option>Seharian (Sampai Tutup)</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={cancelAllPending}
                  className="w-1/3 px-4 py-4 text-sm font-bold text-slate-600 bg-slate-50 border-2 border-slate-200 rounded-2xl hover:bg-slate-100 hover:border-slate-300 transition"
                >
                  Batal
                </button>
                <button
                  onClick={confirmBooking}
                  className="w-2/3 px-4 py-4 text-sm font-black text-white bg-emerald-600 rounded-2xl hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Animation Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `,
        }}
      />
    </div>
  );
}
