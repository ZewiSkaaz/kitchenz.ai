import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "kitchenz.ai - Multipliez vos revenus sur Uber Eats avec l'IA",
  description: "L'outil d'IA qui transforme vos stocks en marques virtuelles rentables. Scannez, générez et vendez sur Uber Eats en 5 minutes.",
  keywords: ["dark kitchen", "uber eats", "ia cuisine", "restaurant virtuel", "restauration", "foodtech"],
  openGraph: {
    title: "kitchenz.ai - Multipliez vos revenus sur Uber Eats avec l'IA",
    description: "L'IA qui crée vos marques virtuelles.",
    url: "https://kitchenz.ai",
    siteName: "Kitchenz AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "kitchenz.ai - L'IA pour les restaurateurs",
    description: "Générez des marques virtuelles rentables en 5 minutes.",
    images: ["/og-image.png"],
  },
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
