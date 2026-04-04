"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/send", label: "Send" },
  { href: "/request", label: "Request" },
  { href: "/feed", label: "Feed" },
  { href: "/contacts", label: "Contacts" }
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1">
      {NAV_LINKS.map(({ href, label }) => {
        const isActive = pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-3 py-1.5 text-sm transition-all duration-300 ${isActive
              ? "bg-white/10 font-semibold text-white shadow-inner"
              : "text-text-muted hover:bg-white/5 hover:text-white"
              }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
