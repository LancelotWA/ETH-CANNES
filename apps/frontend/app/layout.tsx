import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Nav } from "@/components/nav";
import { AppProviders } from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: "ETH Cannes Pay",
  description: "Private & social crypto payments"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-10">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-base font-bold tracking-tight text-white drop-shadow-md">
                ETH Cannes Pay
              </Link>
              <Nav />
            </div>
          </header>
          <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
