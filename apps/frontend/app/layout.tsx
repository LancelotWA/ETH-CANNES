import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import LightRays from "@/components/ui/light-rays";
import { AppDock } from "@/components/ui/app-dock";
import { WalletGuard } from "@/components/wallet/wallet-guard";

export const metadata: Metadata = {
  title: "ICEBERG",
  description: "Private & social crypto payments"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <LightRays raysColor="#8b5cf6" raysSpeed={0.5} pulsating={false} />
          <WalletGuard>
            <AppDock />
            <main className="mx-auto min-h-screen max-w-7xl relative">{children}</main>
          </WalletGuard>
        </AppProviders>
      </body>
    </html>
  );
}
