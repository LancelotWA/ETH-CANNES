import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";
import { AppDock } from "@/components/ui/app-dock";
import { WalletGuard } from "@/components/wallet/wallet-guard";
import { GlobalModeSwitch } from "@/components/ui/global-mode-switch";
import { ThemeWrapper } from "@/components/providers/theme-wrapper";

export const metadata: Metadata = {
  title: "ICEBERG",
  description: "Private & social crypto payments"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <GlobalModeSwitch />
          <ThemeWrapper>
            <WalletGuard>
              <AppDock />
              <main className="mx-auto min-h-screen max-w-7xl relative">{children}</main>
            </WalletGuard>
          </ThemeWrapper>
        </AppProviders>
      </body>
    </html>
  );
}
