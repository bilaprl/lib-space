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

export const metadata = {
  title: "LibSpace: Real-time Library Seat Mapper",
  description: "Aplikasi pemesanan tempat perpustakaan secara real-time",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* Google Material Icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${montserrat.variable} ${openSans.variable} bg-slate-50 text-slate-800 min-h-screen flex flex-col antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
