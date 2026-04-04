import { create } from "zustand";

interface AppState {
  activeUserId: string | null;
  setActiveUserId: (userId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeUserId: null,
  setActiveUserId: (activeUserId) => set({ activeUserId })
}));
