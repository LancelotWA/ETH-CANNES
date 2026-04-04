import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ETH Cannes Pay",
  description: "Private & social crypto payments"
};

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/send", label: "Send" },
  { href: "/request", label: "Request" },
  { href: "/feed", label: "Feed" },
  { href: "/contacts", label: "Contacts" }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-base font-bold tracking-tight text-zinc-900">
              ETH Cannes Pay
            </Link>
            <nav className="flex gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
