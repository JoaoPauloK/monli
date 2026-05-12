import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/constants'
import type { UserRead } from '@/types/auth'

interface AuthState {
  user: UserRead | null
  setUser: (user: UserRead) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: STORAGE_KEYS.AUTH },
  ),
)
