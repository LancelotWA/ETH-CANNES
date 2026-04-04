import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PaymentMode } from "@ethcannes/types"

interface AppState {
  activeUserId: string | null
  walletAddress: string | null
  isConnected: boolean
  authToken: string | null
  globalPaymentMode: PaymentMode
  lastScannedBlock: bigint
  adminBypass: boolean
  setWallet: (address: string, userId: string, token: string) => void
  disconnect: () => void
  togglePaymentMode: () => void
  setLastScannedBlock: (block: bigint) => void
  setAdminBypass: (v: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeUserId: null,
      walletAddress: null,
      isConnected: false,
      authToken: null,
      globalPaymentMode: "PUBLIC",
      lastScannedBlock: 0n,
      adminBypass: false,
      setWallet: (address, userId, token) =>
        set({ walletAddress: address, activeUserId: userId, isConnected: true, authToken: token, globalPaymentMode: "PUBLIC" }),
      disconnect: () =>
        set({ walletAddress: null, activeUserId: null, isConnected: false, authToken: null, adminBypass: false }),
      togglePaymentMode: () =>
        set((state) => ({ globalPaymentMode: state.globalPaymentMode === "PRIVATE" ? "PUBLIC" : "PRIVATE" })),
      setLastScannedBlock: (lastScannedBlock) => set({ lastScannedBlock }),
      setAdminBypass: (v) => set({ adminBypass: v, globalPaymentMode: "PUBLIC" }),
    }),
    {
      name: 'ethcannes-store',
      partialize: (state) => ({
        activeUserId: state.activeUserId,
        walletAddress: state.walletAddress,
        isConnected: state.isConnected,
        authToken: state.authToken,
        globalPaymentMode: state.globalPaymentMode,
        // adminBypass intentionally NOT persisted — resets on page reload
      }),
    }
  )
)
