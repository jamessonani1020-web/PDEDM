import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/providers";
import { SaturnIntro } from "@/components/animations/SaturnIntro";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDEDM — Planetary Defense & Ephemeris Data Manager",
  description:
    "Enterprise-grade dashboard for Near Earth Object telemetry, orbital ephemeris data, and planetary defense monitoring. Powered by NASA NeoWs and JPL Horizons.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-hydration" strategy="beforeInteractive">
          {`
            try {
              var theme = localStorage.getItem('theme') || 'system';
              var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (isDark) document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
            } catch (e) {}
          `}
        </Script>
      </head>
      <body className="min-h-full bg-background text-foreground overflow-x-hidden relative">
        {/* Glowing Orbs Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] rounded-full bg-red-600/10 dark:bg-red-600/30 blur-[150px] dark:mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[70%] rounded-full bg-blue-600/10 dark:bg-blue-600/30 blur-[150px] dark:mix-blend-screen" />
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[40%] rounded-full bg-purple-600/10 dark:bg-purple-600/20 blur-[120px] dark:mix-blend-screen" />
        </div>
        
        <SaturnIntro />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
