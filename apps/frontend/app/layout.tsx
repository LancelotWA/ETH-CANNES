import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ETH Cannes Pay",
  description: "Crypto-native social payments with ENS"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
