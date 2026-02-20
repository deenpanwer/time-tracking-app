import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  userData: any | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  setUserData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userData: null,
      token: null,
      isLoading: false,
      setAuth: (user, token) => set({ user, token, isLoading: false }),
      setUserData: (userData) => set({ userData }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => set({ user: null, userData: null, token: null, isLoading: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
