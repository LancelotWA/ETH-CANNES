import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PaymentMode } from "@ethcannes/types"

interface AppState {
  activeUserId: string | null
  walletAddress: string | null
  isConnected: boolean
  authToken: string | null
  globalPaymentMode: PaymentMode
  setWallet: (address: string, userId: string, token: string) => void
  disconnect: () => void
  togglePaymentMode: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeUserId: null,
      walletAddress: null,
      isConnected: false,
      authToken: null,
      globalPaymentMode: "PRIVATE",
      setWallet: (address, userId, token) =>
        set({ walletAddress: address, activeUserId: userId, isConnected: true, authToken: token }),
      disconnect: () =>
        set({ walletAddress: null, activeUserId: null, isConnected: false, authToken: null }),
      togglePaymentMode: () =>
        set((state) => ({ globalPaymentMode: state.globalPaymentMode === "PRIVATE" ? "PUBLIC" : "PRIVATE" })),
    }),
    { name: 'ethcannes-store' }
  )
)