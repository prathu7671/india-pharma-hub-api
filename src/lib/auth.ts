import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'USER' | 'PROVIDER' | 'ADMIN';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  company?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);