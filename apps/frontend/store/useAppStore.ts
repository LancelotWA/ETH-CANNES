import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  activeUserId: string | null
  walletAddress: string | null
  isConnected: boolean
  authToken: string | null
  setWallet: (address: string, userId: string, token: string) => void
  disconnect: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeUserId: null,
      walletAddress: null,
      isConnected: false,
      authToken: null,
      setWallet: (address, userId, token) =>
        set({ walletAddress: address, activeUserId: userId, isConnected: true, authToken: token }),
      disconnect: () =>
        set({ walletAddress: null, activeUserId: null, isConnected: false, authToken: null }),
    }),
    { name: 'ethcannes-store' }
  )
)