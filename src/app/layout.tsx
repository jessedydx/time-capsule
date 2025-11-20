import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";
import { Navbar } from "../components/Navbar";
import { FarcasterProvider } from "../components/FarcasterProvider";
import { FarcasterWalletConnect } from "../components/FarcasterWalletConnect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Time Capsule",
  description: "Store messages on-chain to be revealed in the future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen pt-16`}
      >
        <Providers>
          <FarcasterProvider>
            <FarcasterWalletConnect />
            <Navbar />
            {children}
          </FarcasterProvider>
        </Providers>
      </body>
    </html>
  );
}
