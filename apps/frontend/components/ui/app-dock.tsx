'use client';

import { useRouter, usePathname } from 'next/navigation';
import Dock from './dock';
import { Home, History, Users, LogOut } from 'lucide-react';
import { useDisconnect } from 'wagmi';
import { useAppStore } from '@/store/useAppStore';

export function AppDock() {
  const router = useRouter();
  const pathname = usePathname();
  const { disconnect } = useDisconnect();
  const storeDisconnect = useAppStore((s) => s.disconnect);

  const handleNavigate = (href: string) => {
    if (pathname === href) return;
    const page = document.getElementById("page-transition-wrapper");
    if (page) {
      page.classList.add("page-exit-active");
    }
    setTimeout(() => router.push(href), 300);
  };

  const handleLogout = () => {
    disconnect();
    storeDisconnect();
    router.push("/");
  };

  const items = [
    { label: "Dashboard", icon: <Home />, onClick: () => handleNavigate('/dashboard') },
    { label: "History", icon: <History />, onClick: () => handleNavigate('/feed') },
    { label: "Contacts", icon: <Users />, onClick: () => handleNavigate('/contacts') },
    { label: "Log Out", icon: <LogOut />, onClick: handleLogout },
  ];

  return <Dock items={items} />;
}
