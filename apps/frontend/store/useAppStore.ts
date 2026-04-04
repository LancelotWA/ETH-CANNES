import { create } from "zustand";

interface AppState {
  // UI state only — wallet address comes from wagmi useAccount()
  lastScannedBlock: bigint;
  setLastScannedBlock: (block: bigint) => void;
}

export const useAppStore = create<AppState>((set) => ({
  lastScannedBlock: 0n,
  setLastScannedBlock: (lastScannedBlock) => set({ lastScannedBlock })
}));
