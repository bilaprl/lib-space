"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { io } from "socket.io-client";
import AdminPanel from "./AdminPanel";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ==========================================
// SUPABASE & BACKEND CONFIG
// ==========================================

const BACKEND_URL = "";
const SOCKET_URL = "";
const ALLOWED_DOMAINS = ["unsil.ac.id", "student.unsil.ac.id"];
const isUniversityEmail = (email) =>
  ALLOWED_DOMAINS.includes(email?.split("@")[1]?.toLowerCase());

// ==========================================
// 1. KONFIGURASI TATA LETAK OVERLAY PETA
// ==========================================
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

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState("student");
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState("map");

  const [seats, setSeats] = useState([]);
  const [myBookedSeats, setMyBookedSeats] = useState([]);
  const [pendingSeats, setPendingSeats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("1 Sesi (2 Jam)");
  const [activeUsers, setActiveUsers] = useState(0);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [countdown, setCountdown] = useState(null);
  const HISTORY_PER_PAGE = 5;

  const currentUserRef = useRef(null);
  const socketRef = useRef(null);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  // Helper: Ambil data kursi dari API
  const fetchSeats = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/seats`);
      const { seats: data } = await res.json();
      // Normalize ID ke string agar cocok dengan seatsConfig
      const normalized = (data || []).map(s => ({ ...s, id: String(s.id) }));
      setSeats(normalized);
      const uid = currentUserRef.current?.id;
      if (uid) {
        setMyBookedSeats(normalized.filter((s) => s.locked_by === uid && s.status === 'booked').map((s) => s.id));
        setPendingSeats(normalized.filter((s) => s.locked_by === uid && s.status === 'booking').map((s) => s.id));
      }
    } catch (err) {
      // silent
    }
  }, []);

  // Helper: Beritahu semua user ada perubahan kursi
  const notifySeatChange = useCallback(() => {
    socketRef.current?.emit('seat_changed');
    fetchSeats();
  }, [fetchSeats]);

  // ==========================================
  // COUNTDOWN TIMER untuk kursi booked
  // ==========================================
  useEffect(() => {
    if (myBookedSeats.length === 0) {
      setCountdown(null);
      return;
    }

    const timer = setInterval(() => {
      // Cari waktu expired dari kursi booked user
      const bookedSeat = seats.find(
        (s) => myBookedSeats.includes(s.id) && s.lock_expires_at
      );

      if (!bookedSeat?.lock_expires_at) {
        setCountdown(null);
        return;
      }

      const endTime = new Date(bookedSeat.lock_expires_at);
      const now = new Date();
      const diffMs = endTime - now;

      if (diffMs <= 0) {
        // Waktu habis! Auto-release
        setCountdown(null);
        clearInterval(timer);
        showToast('⏰ Waktu reservasi habis! Kursi otomatis dilepas.', 'warning');
        notifySeatChange();
        return;
      }

      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      setCountdown({ hours, minutes, seconds, totalMs: diffMs });
    }, 1000);

    return () => clearInterval(timer);
  }, [myBookedSeats, seats, notifySeatChange]);

  // ==========================================
  // AUTO-RELEASE KURSI PENDING (3 MENIT)
  // ==========================================
  useEffect(() => {
    let timeoutId;

    if (pendingSeats.length > 0) {
      // Set timer selama 3 Menit (180.000 ms)
      timeoutId = setTimeout(() => {
        cancelAllPending();
        
        showToast(
          "Waktu pemilihan habis (3 menit). Kursi yang Anda pilih telah dilepaskan kembali oleh sistem.", 
          "warning"
        );
      }, 180000); 
    }

    // Bersihkan timer jika user merubah pilihan atau menekan checkout sebelum 3 menit habis
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pendingSeats, cancelAllPending]);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ==========================================
  // RESTORE SESSION DARI LOCALSTORAGE
  // ==========================================
  useEffect(() => {
    setMounted(true);
    const savedToken = localStorage.getItem("libspace_token");
    const savedUser = localStorage.getItem("libspace_user");
    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setToken(savedToken);
        setCurrentUser(user);
        setUserRole(user.role);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem("libspace_token");
        localStorage.removeItem("libspace_user");
      }
    }
  }, []);

  // ==========================================
  // SOCKET.IO: REAL-TIME UPDATES
  // ==========================================
  useEffect(() => {
    if (!isLoggedIn || typeof window === 'undefined') return;

    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      withCredentials: false,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      // connected
      // Kirim userId agar server bisa hitung user unik
      const uid = currentUserRef.current?.id;
      if (uid) socket.emit('register_user', uid);
    });

    socket.on('connect_error', (err) => {
      // connection error - silent
    });

    // Saat ada user lain yang mengubah kursi, re-fetch data
    socket.on('seat_updated', () => {
      // seat update received
      fetchSeats();
    });

    // Update jumlah user yang sedang online
    socket.on('active_users', (count) => {
      // active users updated
      setActiveUsers(count);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isLoggedIn, fetchSeats]);

  // ==========================================
  // FETCH KURSI AWAL
  // ==========================================
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchSeats();
  }, [isLoggedIn, fetchSeats]);

  // ==========================================
  // FETCH RIWAYAT SAAT TAB HISTORY DIBUKA
  // ==========================================
  useEffect(() => {
    if (activeTab !== "history" || !token) return;
    fetch(`${BACKEND_URL}/api/users/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(({ history: data }) => setHistory(data || []))
      .catch(() => {});
  }, [activeTab, token]);

  // ==========================================
  // FETCH STATISTIK SAAT TAB STATS DIBUKA
  // ==========================================
  useEffect(() => {
    if (activeTab !== "stats" || !token) return;
    fetch(`${BACKEND_URL}/api/users/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, [activeTab, token]);

  const availableCount = seats.filter((s) => s.status === "available").length;

  // ==========================================
  // LOGIN MANUAL
  // ==========================================
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoginError("");
    const identifier = loginForm.identifier.trim();
    if (!identifier.includes("@") || !isUniversityEmail(identifier)) {
      setLoginError("Gunakan email universitas (@unsil.ac.id atau @student.unsil.ac.id)");
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password: loginForm.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal");
      localStorage.setItem("libspace_token", data.token);
      localStorage.setItem("libspace_user", JSON.stringify(data.user));
      setToken(data.token);
      setCurrentUser(data.user);
      setUserRole(data.user.role);
      setIsLoggedIn(true);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ==========================================
  // LOGIN GOOGLE OAUTH VIA SUPABASE
  // ==========================================
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      },
    });
    if (error) setLoginError("Gagal login dengan Google: " + error.message);
  };

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("libspace_token");
    localStorage.removeItem("libspace_user");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setToken(null);
    setUserRole("student");
    setSeats([]);
    setMyBookedSeats([]);
    setPendingSeats([]);
    setHistory([]);
    setStats(null);
  };

  // ==========================================
  // ADMIN: FORCE RELEASE (KICK)
  // ==========================================
  const adminForceRelease = async (seatId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/seats/kick`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seatId }),
      });
      if (res.ok) notifySeatChange();
    } catch (err) {
      showToast("Gagal kick kursi: " + err.message);
    }
  };

  // ==========================================
  // KLIK KURSI → BOOKING SEMENTARA
  // ==========================================
  const handleSeatClick = async (seatId) => {
    if (activeTab !== "map") return;

    const seat = seats.find((s) => s.id === seatId);
    if (!seat) return;

    if (currentUser?.role !== 'student' && currentUser?.role !== 'admin') {
      showToast("Akses ditolak. Role Anda saat ini: " + currentUser?.role);
      return;
    }

    if (myBookedSeats.length > 0) {
      showToast("Anda sudah memiliki reservasi aktif. Selesaikan dulu sebelum memilih kursi baru.", "warning");
      return;
    }

    if (seat.status === "booking" && pendingSeats.includes(seatId)) {
      try {
        await fetch(`${BACKEND_URL}/api/seats/${seatId}/cancel-booking`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        notifySeatChange();
      } catch (err) {
        showToast(err.message);
      }
      return;
    }

    if (seat.status !== "available") return;

    if (pendingSeats.length >= 4) {
      showToast("Maksimal pemesanan dalam satu waktu adalah 4 kursi.", "warning");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/seats/${seatId}/book`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notifySeatChange();
    } catch (err) {
      showToast(err.message);
    }
  };

  // ==========================================
  // BATALKAN SEMUA PILIHAN
  // ==========================================
  const cancelAllPending = async () => {
    try {
      await Promise.all(
        pendingSeats.map((id) =>
          fetch(`${BACKEND_URL}/api/seats/${id}/cancel-booking`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      notifySeatChange();
    } catch (err) {
      // silent
    }
    setIsModalOpen(false);
  };

  // ==========================================
  // KONFIRMASI CHECKOUT
  // ==========================================
  const confirmBooking = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/seats/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seatIds: pendingSeats, durationType: selectedDuration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notifySeatChange();
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.message);
    }
  };

  // ==========================================
  // SELESAI BELAJAR → RELEASE KURSI
  // ==========================================
  const releaseMySeats = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/seats/release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seatIds: myBookedSeats }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notifySeatChange();
    } catch (err) {
      showToast(err.message);
    }
  };

  if (!mounted) return null;

  if (userRole === "admin") {
    return (
      <AdminPanel
        seats={seats}
        onRelease={adminForceRelease}
        onLogout={handleLogout}
        activeUsers={activeUsers}
        token={token}
      />
    );
  }

  // ==========================================
  // LAYAR LOGIN
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-emerald-950 font-sans overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url('https://assets.radartasik.id/main/2024/04/perpus-unsil.webp')" }}
        ></div>
        <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-[6px] z-0"></div>

        <div className="w-full max-w-7xl z-10 flex flex-col lg:flex-row items-center justify-between gap-12 px-6 py-12 lg:px-12">
          {/* KIRI */}
          <div className="w-full lg:w-1/2 text-left flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/30 bg-emerald-900/50 backdrop-blur-md mb-6 w-fit shadow-lg">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-50 tracking-[0.2em] uppercase">
                Sistem Reservasi Real-time
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight drop-shadow-xl">
              LibSpace<span className="text-yellow-400">.</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-emerald-100/90 leading-relaxed max-w-md font-medium drop-shadow-md">
              Eksplorasi tata letak perpustakaan, pantau ketersediaan kursi, dan
              amankan tempat belajarmu di Universitas Siliwangi hanya dalam hitungan detik.
            </p>
          </div>

          {/* KANAN: Form Login */}
          <div className="w-full lg:w-[45%] max-w-md">
            <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden border border-emerald-50">
              <div className="mb-8">
                <div className="w-16 h-16 bg-white border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm mb-6 overflow-hidden mx-auto sm:mx-0">
                  <img src="/logo.png" alt="Logo Unsil" className="w-12 h-12 object-contain" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2 text-center sm:text-left">
                  Selamat Datang
                </h2>
                <p className="text-slate-500 font-medium text-sm text-center sm:text-left">
                  Masuk dengan kredensial Siliwangi Anda untuk melanjutkan.
                </p>
              </div>

              {loginError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                  {loginError}
                </div>
              )}

              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-sm mb-6 group text-sm sm:text-base"
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
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Atau Manual</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email Universitas"
                    value={loginForm.identifier}
                    onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-2xl px-5 py-3.5 sm:py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm text-sm sm:text-base"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    required
                    placeholder="Kata Sandi"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-2xl px-5 py-3.5 sm:py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm text-sm sm:text-base"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black py-3.5 sm:py-4 px-6 rounded-2xl shadow-[0_10px_20px_rgba(5,150,105,0.2)] transition-all mt-6 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                >
                  {isLoggingIn ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
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
  // MAIN DASHBOARD
  // ==========================================
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <nav className="flex-shrink-0 bg-white border-r border-slate-200 z-50 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-stretch sm:w-24 lg:w-72 h-20 sm:h-screen w-full fixed sm:relative bottom-0 sm:bottom-auto order-last sm:order-first shadow-[0_-4px_20px_rgba(0,0,0,0.03)] sm:shadow-[4px_0_24px_rgba(0,0,0,0.03)] transition-all duration-300">
        <div className="flex items-center justify-center lg:justify-start lg:px-8 h-20 sm:h-24 sm:border-b border-slate-100 w-auto sm:w-full ml-4 sm:ml-0 flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center lg:mr-4 flex-shrink-0 overflow-hidden">
            <img src="/logo.png" alt="Logo Unsil" className="w-full h-full object-contain" />
          </div>
          <div className="hidden lg:block">
            <span className="font-black text-xl text-slate-900 tracking-tight block leading-none">LibSpace</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Univ. Siliwangi</span>
          </div>
        </div>

        <div className="flex-1 flex sm:flex-col items-center sm:items-stretch justify-around sm:justify-start px-2 lg:px-4 py-2 sm:py-6 gap-2 sm:gap-4 overflow-y-auto w-full hide-scrollbar">
          <button
            onClick={() => setActiveTab("map")}
            className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-4 px-2 lg:px-4 py-2 lg:py-3.5 rounded-xl transition-all flex-1 sm:flex-none max-w-[80px] sm:max-w-none w-full border ${activeTab === "map" ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"}`}
          >
            <span className="material-symbols-outlined text-[24px]">grid_view</span>
            <span className="text-[10px] lg:text-sm block sm:hidden lg:block truncate w-full text-center lg:text-left">Peta</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-4 px-2 lg:px-4 py-2 lg:py-3.5 rounded-xl transition-all flex-1 sm:flex-none max-w-[80px] sm:max-w-none w-full border ${activeTab === "history" ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"}`}
          >
            <span className="material-symbols-outlined text-[24px]">history</span>
            <span className="text-[10px] lg:text-sm block sm:hidden lg:block truncate w-full text-center lg:text-left">Riwayat</span>
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-4 px-2 lg:px-4 py-2 lg:py-3.5 rounded-xl transition-all flex-1 sm:flex-none max-w-[80px] sm:max-w-none w-full border ${activeTab === "stats" ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"}`}
          >
            <span className="material-symbols-outlined text-[24px]">analytics</span>
            <span className="text-[10px] lg:text-sm block sm:hidden lg:block truncate w-full text-center lg:text-left">Statistik</span>
          </button>

          <div className="hidden sm:block w-full h-px bg-slate-100 my-2"></div>
        </div>

        <div className="flex sm:flex-col items-center justify-center lg:justify-start h-20 sm:h-auto sm:pb-6 w-auto sm:w-full mr-4 sm:mr-0 flex-shrink-0 lg:px-4 gap-4">
          <div className="hidden sm:flex items-center bg-slate-50 p-3 lg:px-4 lg:py-3 rounded-2xl border border-slate-200 shadow-sm gap-3 w-full mb-1">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border border-slate-300">
              <img
                src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.nama || "user"}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{currentUser?.nama || "Pengguna"}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser?.email || ""}</p>
            </div>
          </div>

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
            onClick={handleLogout}
            className="flex items-center justify-center lg:justify-start gap-1 lg:gap-3 px-2 lg:px-4 py-2 lg:py-0 w-12 h-12 lg:w-full lg:h-12 rounded-xl bg-white sm:hover:bg-red-50 text-slate-500 sm:hover:text-red-600 border-none sm:border-solid border border-transparent sm:border-slate-200 sm:hover:border-red-200 transition-all font-bold group"
          >
            <span className="material-symbols-outlined text-[24px] lg:text-[20px] lg:group-hover:-translate-x-1 transition-transform">logout</span>
            <span className="hidden lg:block text-sm">Keluar Akun</span>
          </button>
        </div>
      </nav>

      {/* AREA KONTEN UTAMA */}
      <div className="flex-1 overflow-y-auto h-screen relative bg-slate-50 pb-24 sm:pb-0">
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 flex flex-col gap-6 sm:gap-8">

          {/* TAB: PETA */}
          {activeTab === "map" && (
            <>
              {myBookedSeats.length > 0 && (
                <div className="bg-emerald-800 rounded-3xl shadow-2xl relative overflow-hidden border border-emerald-700 p-5 sm:p-8 animate-[fadeIn_0.5s_ease-out]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 relative z-10 w-full md:w-auto">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-300 text-3xl sm:text-4xl">confirmation_number</span>
                        <div>
                          <h2 className="font-bold text-lg sm:text-xl text-white leading-tight">Tiket Aktifmu</h2>
                          <span className="text-[10px] sm:text-xs text-emerald-200">Sedang Digunakan</span>
                        </div>
                      </div>
                      <div className="hidden sm:block w-px h-10 bg-emerald-600"></div>
                      <div className="flex flex-wrap gap-2">
                        {myBookedSeats.map((id) => {
                          const labelId = seatsConfig.find((s) => s.id === id)?.label || id;
                          return (
                            <span key={id} className="bg-white text-emerald-800 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black shadow-lg text-base sm:text-lg">
                              {labelId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      onClick={releaseMySeats}
                      className="w-full md:w-auto px-6 py-3.5 sm:py-4 text-sm font-bold text-rose-100 bg-rose-500/20 border border-rose-500/30 rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 relative z-10 flex-shrink-0"
                    >
                      Selesai Belajar
                    </button>
                  </div>

                  {/* COUNTDOWN TIMER */}
                  {countdown && (
                    <div className="mt-5 pt-5 border-t border-emerald-600/50 relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-amber-300 text-xl animate-pulse">timer</span>
                        <span className="text-sm font-semibold text-emerald-200">Sisa Waktu Reservasi</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-emerald-900/80 border border-emerald-600/50 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-center min-w-[60px] sm:min-w-[72px]">
                          <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                            {String(countdown.hours).padStart(2, '0')}
                          </div>
                          <div className="text-[8px] sm:text-[9px] font-bold text-emerald-300 uppercase tracking-widest mt-0.5">Jam</div>
                        </div>
                        <span className="text-2xl font-black text-emerald-400 animate-pulse">:</span>
                        <div className="bg-emerald-900/80 border border-emerald-600/50 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-center min-w-[60px] sm:min-w-[72px]">
                          <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                            {String(countdown.minutes).padStart(2, '0')}
                          </div>
                          <div className="text-[8px] sm:text-[9px] font-bold text-emerald-300 uppercase tracking-widest mt-0.5">Menit</div>
                        </div>
                        <span className="text-2xl font-black text-emerald-400 animate-pulse">:</span>
                        <div className="bg-emerald-900/80 border border-emerald-600/50 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-center min-w-[60px] sm:min-w-[72px]">
                          <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                            {String(countdown.seconds).padStart(2, '0')}
                          </div>
                          <div className="text-[8px] sm:text-[9px] font-bold text-emerald-300 uppercase tracking-widest mt-0.5">Detik</div>
                        </div>
                        {/* Warning jika kurang dari 3 menit */}
                        {countdown.totalMs < 180000 && (
                          <div className="ml-2 sm:ml-4 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            Segera Habis!
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <section className="w-full animate-[fadeIn_0.3s_ease-out]">
                <div className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <h2 className="font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">Denah Interaktif</h2>
                      <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2 font-medium">
                        Klik kursi pada peta di bawah ini untuk mengamankan tempatmu.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-emerald-50 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-emerald-100 flex-shrink-0 w-full sm:w-auto">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined text-[24px] sm:text-[28px]">event_seat</span>
                      </div>
                      <div>
                        <div className="font-black text-2xl sm:text-3xl text-emerald-700 leading-none">{availableCount}</div>
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1">Tersedia</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 border border-slate-200 flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4 lg:gap-8 overflow-x-auto hide-scrollbar">
                    <div className="flex items-center gap-2 text-slate-400 whitespace-nowrap">
                      <span className="material-symbols-outlined text-[18px] sm:text-[20px]">map</span>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Legenda Peta:</span>
                    </div>
                    <div className="flex flex-row lg:flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto">
                      {[
                        { color: "bg-emerald-400 border-emerald-500 text-white", label: "Tersedia" },
                        { color: "bg-emerald-100 border-emerald-300 text-emerald-700", label: "Dipilih" },
                        { color: "bg-rose-500 border-rose-600 text-white", label: "Terisi" },
                        { color: "bg-emerald-700 border-emerald-600 ring-2 ring-emerald-400/50 text-white", label: "Posisi Anda" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 sm:gap-2.5 whitespace-nowrap">
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center text-[8px] sm:text-[10px] font-bold ${item.color}`}>1</div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-600">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto hide-scrollbar pb-4 -mx-1 px-1">
                    <div className="relative min-w-[700px] sm:min-w-[800px] w-full max-w-[1200px] mx-auto select-none rounded-sm shadow-xl border-4 border-slate-200 overflow-hidden bg-white">
                      <img src="/map.png" alt="Denah Perpustakaan" className="w-full h-auto block pointer-events-none" />
                      {seats.map((seat) => {
                        const config = seatsConfig.find((s) => s.id === seat.id);
                        if (!config) return null;
                        const isPending = pendingSeats.includes(seat.id);
                        const isMyBooked = myBookedSeats.includes(seat.id);
                        let baseClass = `absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-[9px] sm:text-[11px] font-black transition-all duration-300 z-30 border-2 shadow-[2px_3px_5px_rgba(0,0,0,0.4)] backdrop-blur-sm cursor-pointer `;
                        if (config.shape === "circle") baseClass += "w-[4%] aspect-square rounded-full ";
                        else baseClass += "w-[3.5%] aspect-square rounded-md ";
                        let statusClass = "";
                        if (isMyBooked) statusClass = "bg-emerald-700 text-white border-emerald-600 ring-4 ring-emerald-400/50 shadow-[0_0_20px_rgba(4,120,87,0.8)] scale-110 z-40 cursor-not-allowed";
                        else if (isPending) statusClass = "bg-emerald-100 text-emerald-800 border-emerald-400 ring-4 ring-emerald-300/50 scale-110 shadow-2xl z-40";
                        else if (seat.status === "booking") statusClass = "bg-slate-300 text-slate-600 border-slate-400 animate-pulse cursor-not-allowed";
                        else if (seat.status === "booked") statusClass = "bg-rose-500/90 text-white border-rose-600 cursor-not-allowed";
                        else if (seat.status === "available") statusClass = "bg-emerald-400/80 text-white border-emerald-500 hover:scale-110 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/40 hover:z-40";
                        return (
                          <div
                            key={seat.id}
                            onClick={() => handleSeatClick(seat.id)}
                            className={baseClass + statusClass}
                            style={{ left: config.x, top: config.y }}
                            title={isMyBooked ? "Kursi Anda" : `Pilih Kursi ${config.label}`}
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

          {/* TAB: RIWAYAT */}
          {activeTab === "history" && (
            <section className="w-full animate-[fadeIn_0.3s_ease-out]">
              <div className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="mb-6 sm:mb-8">
                  <h2 className="font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">Riwayat Reservasi</h2>
                  <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2 font-medium">
                    Catatan lengkap aktivitas peminjaman kursimu di LibSpace.
                  </p>
                </div>
                <div className="overflow-x-auto hide-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b-2 border-slate-100">
                        <th className="pb-4 pt-2 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">ID Reservasi</th>
                        <th className="pb-4 pt-2 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Waktu</th>
                        <th className="pb-4 pt-2 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Nomor Kursi</th>
                        <th className="pb-4 pt-2 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Durasi</th>
                        <th className="pb-4 pt-2 px-2 sm:px-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                            Belum ada riwayat reservasi.
                          </td>
                        </tr>
                      ) : history.slice((historyPage - 1) * HISTORY_PER_PAGE, historyPage * HISTORY_PER_PAGE).map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-emerald-50/50 transition-colors group">
                          <td className="py-4 sm:py-5 px-2 sm:px-4 font-bold text-slate-900 text-sm sm:text-base">{item.id}</td>
                          <td className="py-4 sm:py-5 px-2 sm:px-4">
                            <span className="block font-semibold text-slate-800 text-sm sm:text-base">{item.date}</span>
                            <span className="block text-[10px] sm:text-xs text-slate-500 mt-0.5">{item.time}</span>
                          </td>
                          <td className="py-4 sm:py-5 px-2 sm:px-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs sm:text-sm">{item.seat}</div>
                              <span className="text-xs sm:text-sm font-semibold text-slate-600">{item.type}</span>
                            </div>
                          </td>
                          <td className="py-4 sm:py-5 px-2 sm:px-4 font-semibold text-slate-700 text-sm sm:text-base">{item.duration}</td>
                          <td className="py-4 sm:py-5 px-2 sm:px-4 text-right">
                            <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold ${item.status === "Selesai" ? "bg-emerald-100 text-emerald-700" : item.status === "Aktif" ? "bg-blue-100 text-blue-700" : item.status === "Batal" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                {history.length > HISTORY_PER_PAGE && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                    <p className="text-xs sm:text-sm text-slate-400 font-medium">
                      Menampilkan {Math.min((historyPage - 1) * HISTORY_PER_PAGE + 1, history.length)}-{Math.min(historyPage * HISTORY_PER_PAGE, history.length)} dari {history.length} data
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                        disabled={historyPage === 1}
                        className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                      </button>
                      {Array.from({ length: Math.ceil(history.length / HISTORY_PER_PAGE) }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setHistoryPage(i + 1)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${historyPage === i + 1
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                            : 'border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setHistoryPage(p => Math.min(Math.ceil(history.length / HISTORY_PER_PAGE), p + 1))}
                        disabled={historyPage >= Math.ceil(history.length / HISTORY_PER_PAGE)}
                        className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB: STATISTIK */}
          {activeTab === "stats" && (
            <section className="w-full animate-[fadeIn_0.3s_ease-out] flex flex-col gap-5 sm:gap-6">
              <div className="mb-1 sm:mb-2">
                <h2 className="font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight">Statistik Belajar</h2>
                <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2 font-medium">Pantau terus produktivitas belajarmu di perpustakaan.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <span className="material-symbols-outlined text-[28px] sm:text-[32px]">schedule</span>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Waktu Belajar</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                      {stats?.totalHours ?? "-"}{" "}<span className="text-base sm:text-lg font-bold text-slate-500">Jam</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                    <span className="material-symbols-outlined text-[28px] sm:text-[32px]">check_circle</span>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Kunjungan</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                      {stats?.totalSessions ?? "-"}{" "}<span className="text-base sm:text-lg font-bold text-slate-500">Sesi</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 sm:gap-5 sm:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                    <span className="material-symbols-outlined text-[28px] sm:text-[32px]">star</span>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kursi Favorit</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                      {stats?.favoriteSeat ?? "-"}{" "}<span className="text-base sm:text-lg font-bold text-slate-500">{stats?.favoriteType ?? ""}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 mt-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4">
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl text-slate-900">Aktivitas 7 Hari Terakhir</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Berdasarkan durasi reservasi harian</p>
                  </div>
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 border border-emerald-100 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-emerald-700">
                    {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                  </div>
                </div>
                <div className="flex items-end gap-2 sm:gap-6 mt-4 sm:mt-6 pb-2 border-b border-slate-100" style={{ height: '180px' }}>
                  {(stats?.last7Days || [
                    { day: "Sen", hours: 0 }, { day: "Sel", hours: 0 }, { day: "Rab", hours: 0 },
                    { day: "Kam", hours: 0 }, { day: "Jum", hours: 0 }, { day: "Sab", hours: 0 }, { day: "Min", hours: 0 },
                  ]).map((item, i, arr) => {
                    const maxH = Math.max(...arr.map((d) => d.hours), 1);
                    const pct = item.hours > 0 ? Math.max(Math.round((item.hours / maxH) * 100), 12) : 6;
                    const isToday = i === arr.length - 1;
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 group cursor-default h-full justify-end relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] font-bold text-white bg-slate-700 px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {item.hours > 0 ? `${item.hours} jam` : '0 jam'}
                        </div>
                        {/* Bar */}
                        <div
                          className={`w-6 sm:w-10 rounded-t-lg sm:rounded-t-xl transition-all duration-500 ${isToday ? 'bg-emerald-500 group-hover:bg-emerald-400 shadow-lg shadow-emerald-200' :
                            item.hours > 0 ? 'bg-emerald-400 group-hover:bg-emerald-500' :
                              'bg-slate-200 group-hover:bg-slate-300'
                            }`}
                          style={{ height: `${pct}%`, minHeight: '8px' }}
                        ></div>
                        {/* Day label */}
                        <span className={`mt-2 sm:mt-3 text-[9px] sm:text-xs font-bold ${isToday ? 'text-emerald-600' : 'text-slate-400'
                          }`}>{item.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          <footer className="mt-auto pt-6 pb-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-xs font-medium text-slate-400 w-full animate-[fadeIn_0.5s_ease-out]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[12px] sm:text-[14px] font-bold">account_balance</span>
              </div>
              <span className="text-slate-700 font-black tracking-tight text-xs sm:text-sm">
                LibSpace <span className="font-semibold text-slate-400 hidden sm:inline-block">| Univ. Siliwangi</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-center sm:text-right">
              <p>© 2026 Sistem Reservasi Real-time.</p>
            </div>
          </footer>
        </main>
      </div>

      {/* FLOATING ACTION BAR */}
      {activeTab === "map" && pendingSeats.length > 0 && !isModalOpen && (
        <div className="fixed bottom-24 sm:bottom-10 left-1/2 -translate-x-1/2 bg-white border border-slate-200 p-2 sm:p-2.5 pl-6 sm:pl-8 pr-2 sm:pr-2.5 rounded-full shadow-2xl flex items-center gap-4 sm:gap-6 z-50 animate-[bounce_1s_ease-in-out_infinite] w-max max-w-[90vw]">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-emerald-100 text-emerald-700 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs sm:text-sm">{pendingSeats.length}</div>
            <span className="font-bold text-xs sm:text-sm text-slate-700 tracking-wide block">Kursi Dipilih</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cancelAllPending}
              className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-1 sm:gap-2 hover:scale-105 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">close</span> Batal
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-full font-black text-xs sm:text-sm transition-all shadow-[0_5px_15px_rgba(5,150,105,0.3)] flex items-center gap-1 sm:gap-2 hover:scale-105 whitespace-nowrap"
            >
              Checkout <span className="material-symbols-outlined text-base sm:text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI */}
      {activeTab === "map" && isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={cancelAllPending}></div>
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl z-10 w-full max-w-md overflow-hidden transform transition-all scale-100 border border-slate-100 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-emerald-800 px-6 sm:px-8 py-5 sm:py-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
              <h3 className="font-black text-lg sm:text-xl text-white relative z-10">Konfirmasi Tiket</h3>
              <button onClick={cancelAllPending} className="text-emerald-200 hover:text-white hover:bg-white/10 p-1.5 sm:p-2 rounded-full transition relative z-10">
                <span className="material-symbols-outlined block text-[20px] sm:text-[24px]">close</span>
              </button>
            </div>
            <div className="p-6 sm:p-8">
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 border border-slate-200">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 sm:mb-3">Rangkuman Pesanan</p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-bold text-sm sm:text-base">Jumlah Kursi</span>
                  <span className="font-black text-slate-900 text-lg sm:text-xl">{pendingSeats.length}{" "}<span className="text-xs sm:text-sm font-semibold text-slate-500">Kursi</span></span>
                </div>
                <div className="flex gap-2 mt-3 sm:mt-4 flex-wrap">
                  {pendingSeats.map((id) => {
                    const labelId = seatsConfig.find((s) => s.id === id)?.label || id;
                    return (
                      <span key={id} className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm shadow-sm">
                        {labelId}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="mb-6 sm:mb-8">
                <label className="block text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 sm:mb-3">Pilih Durasi Peminjaman</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 text-slate-800 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3.5 sm:p-4 outline-none transition cursor-pointer appearance-none shadow-sm"
                >
                  <option>1 Sesi (2 Jam)</option>
                  <option>2 Sesi (4 Jam)</option>
                  <option>Seharian (Sampai Tutup)</option>
                </select>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button onClick={cancelAllPending} className="w-1/3 px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-bold text-slate-600 bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl hover:bg-slate-100 hover:border-slate-300 transition">Batal</button>
                <button onClick={confirmBooking} className="w-2/3 px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-black text-white bg-emerald-600 rounded-xl sm:rounded-2xl hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1 sm:gap-2">Konfirmasi</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideOutRight { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100px); } }
      `}} />

      {/* CUSTOM TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] animate-[slideInRight_0.3s_ease-out]">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md max-w-sm ${toast.type === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' :
            toast.type === 'warning' ? 'bg-amber-50/95 border-amber-200 text-amber-800' :
              'bg-rose-50/95 border-rose-200 text-rose-800'
            }`}>
            <span className={`material-symbols-outlined text-xl flex-shrink-0 ${toast.type === 'success' ? 'text-emerald-500' :
              toast.type === 'warning' ? 'text-amber-500' :
                'text-rose-500'
              }`}>
              {toast.type === 'success' ? 'check_circle' : toast.type === 'warning' ? 'warning' : 'error'}
            </span>
            <p className="text-sm font-semibold leading-snug">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-2 text-current opacity-40 hover:opacity-100 transition-opacity flex-shrink-0">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
