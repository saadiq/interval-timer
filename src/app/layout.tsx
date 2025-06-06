// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Interval Timer - Workout of the Day",
  description:
    "Track your workout of the day with our interval timer. Bodyweight workouts requiring no commitment. Get moving.",
  icons: {
    icon: "/timer.svg",
  },
  openGraph: {
    title: "Interval Timer - Workout of the Day",
    description:
      "Track your workout of the day with our interval timer. Bodyweight workouts requiring no commitment. Get moving.",
    type: "website",
    url: "https://interval-timer-rho.vercel.app",
    images: [
      {
        url: "https://interval-timer-rho.vercel.app/api/og",
        width: 1200,
        height: 630,
        alt: "Interval Timer Preview Workout of the Day",
      },
    ],
    siteName: "Interval Timer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interval Timer - Workout of the Day",
    description:
      "Track your workout of the day with our interval timer. Bodyweight workouts requiring no commitment. Get moving.",
    images: ["https://interval-timer-rho.vercel.app/api/og"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen pt-4">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
