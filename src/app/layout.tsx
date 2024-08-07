import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  console.log('Generating metadata');

  const date = new Date().toISOString().split('T')[0];
  console.log('Using date:', date);

  const title = `Interval Timer - Workout for ${date}`;
  const description = `Track your workout for ${date} with our interval timer. Bodyweight workouts requiring no commitment. Get moving.`;
  const imageUrl = `https://interval-timer-rho.vercel.app/api/og?date=${date}`;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://interval-timer-rho.vercel.app`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Interval Timer Preview for ${date}`,
        },
      ],
      siteName: "Interval Timer",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };

  console.log('Generated metadata:', metadata);

  return metadata;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}