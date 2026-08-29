import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/providers";
import { GlobalLoader } from "@/components/animations/GlobalLoader";
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
    "Real-time dashboard for tracking Near Earth Objects using NASA NeoWs and JPL Horizons data. View asteroid approach forecasts, orbital parameters, and threat assessments.",
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
      </head>
      <body className="min-h-full bg-background text-foreground antialiased">
        <GlobalLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
