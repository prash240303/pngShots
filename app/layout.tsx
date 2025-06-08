import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "60fps - Screenshot Gallery",
  description:
    "Endless collection of delightful details from best-in-class apps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />

        {/* Hero Section with background text */}
        <section className="relative h-[32vh] bg-gradient-to-b from-gray-50 to-white overflow-hidden"></section>

        <main className="min-h-screen bg-[#F5F5F5] relative z-30">
          {children}
        </main>

        <Toaster />
      </body>
    </html>
  );
}
