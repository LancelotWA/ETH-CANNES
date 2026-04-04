"use client";

import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";

export function TransitionLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const router = useRouter();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const page = document.getElementById("page-transition-wrapper");
    if (page) {
      page.classList.add("page-exit-active");
    }
    setTimeout(() => {
      router.push(href);
    }, 300);
  };

  return (
    <a href={href} className={className} onClick={handleTransition}>
      {children}
    </a>
  );
}
