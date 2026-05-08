"use client";

import { useEffect } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Ambil hash fragment dari URL (Supabase kirim token via URL hash)
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace('#', ''));
        const accessToken = params.get('access_token');

        if (!accessToken) {
          console.error("Tidak ada access token di URL");
          window.location.href = "/";
          return;
        }

        // Decode token untuk ambil data user
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const email = payload.email;
        const nama = payload.user_metadata?.full_name || 
                     payload.user_metadata?.name || 
                     email;
        const avatar_url = payload.user_metadata?.avatar_url || 
                           payload.user_metadata?.picture;
        const google_id = payload.sub;

        // Kirim ke backend
        const res = await fetch(`${BACKEND_URL}/api/auth/google-supabase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, nama, avatar_url, google_id }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Login gagal");
          window.location.href = "/";
          return;
        }

        localStorage.setItem("libspace_token", data.token);
        localStorage.setItem("libspace_user", JSON.stringify(data.user));
        window.location.href = "/";

      } catch (err) {
        console.error("Callback error:", err);
        alert("Terjadi kesalahan saat login: " + err.message);
        window.location.href = "/";
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-950">
      <div className="flex flex-col items-center gap-4 text-white">
        <span className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></span>
        <p className="font-bold text-lg">Memproses login Google...</p>
        <p className="text-emerald-300 text-sm">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}