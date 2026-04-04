'use client';

import { useRouter } from 'next/navigation';
import Dock from './dock';
import { Home, Send, History, Users, QrCode } from 'lucide-react';

export function AppDock() {
  const router = useRouter();

  const handleNavigate = (href: string) => {
    const page = document.getElementById("page-transition-wrapper");
    if (page) {
      page.classList.add("page-exit-active");
    }
    setTimeout(() => router.push(href), 300);
  };

  const items = [
    { label: "Dashboard", icon: <Home />, onClick: () => handleNavigate('/dashboard') },
    { label: "Send Payment", icon: <Send />, onClick: () => handleNavigate('/send') },
    { label: "Request QR", icon: <QrCode />, onClick: () => handleNavigate('/request') },
    { label: "History", icon: <History />, onClick: () => handleNavigate('/feed') },
    { label: "Contacts", icon: <Users />, onClick: () => handleNavigate('/contacts') },
  ];

  return <Dock items={items} />;
}
