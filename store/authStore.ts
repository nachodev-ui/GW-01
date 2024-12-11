import { create } from "zustand"
import { AuthStore } from "@/types/type"

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  role: null,
  isAuthenticated: undefined,

  setRole: (role) => set({ role }),
  setUser: (user) => set({ user }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}))
