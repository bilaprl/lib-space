import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["500", "600", "700", "800"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
});

// Metadata terpisah untuk SEO
export const metadata = {
  title: "LibSpace: Real-time Library Seat Mapper",
  description: "Aplikasi pemesanan tempat perpustakaan secara real-time",
};

// Konfigurasi viewport khusus Next.js 14+ untuk responsivitas maksimal
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Mengunci zoom maksimal (Mencegah layar nge-zoom saat map ditekan double tap di HP)
  userScalable: false,
  themeColor: "#064e3b", // Warna status bar di mobile (menyesuaikan warna emerald-950)
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Google Material Icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${montserrat.variable} ${openSans.variable} bg-slate-50 text-slate-800 min-h-screen flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-900`}
      >
        {children}
      </body>
    </html>
  );
}
