import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sleepdebtcalculator.app"),
  title: "Sleep Debt Calculator | Track Debt, Recover Faster",
  description:
    "Calculate cumulative sleep debt, log nightly sleep, and follow a personalized recovery plan with health impact warnings.",
  openGraph: {
    title: "Sleep Debt Calculator",
    description:
      "A practical dashboard for sleep debt tracking, recovery planning, and health impact warnings.",
    url: "https://sleepdebtcalculator.app",
    siteName: "Sleep Debt Calculator",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Sleep Debt Calculator",
    description:
      "Track cumulative sleep debt and follow recovery recommendations built for busy professionals and shift workers."
  },
  alternates: {
    canonical: "/"
  },
  keywords: [
    "sleep debt",
    "sleep tracking",
    "recovery plan",
    "health dashboard",
    "shift worker sleep"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-[var(--font-sans)] antialiased">{children}</body>
    </html>
  );
}
