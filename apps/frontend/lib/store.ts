import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  userId: string | null;
  jwt: string | null;
  setAuth: (userId: string, jwt: string) => void;
  clearAuth: () => void;
}

export const useAppStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      jwt: null,
      setAuth: (userId, jwt) => set({ userId, jwt }),
      clearAuth: () => set({ userId: null, jwt: null }),
    }),
    { name: "phntm-auth" }
  )
);
