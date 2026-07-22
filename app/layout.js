import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DVS Tech Dashboard",
  description: "Business Command Center",
  icons: {
  icon: [
    {
      url: "/dvs-dashboard-favicon-2026.png",
      type: "image/png",
    },
  ],
  shortcut: "/dvs-dashboard-favicon-2026.png",
  apple: "/dvs-dashboard-favicon-2026.png",
},
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}