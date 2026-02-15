import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  selectedProfile: any | null;
  isProfileOpen: boolean;
  openProfile: (profile: any) => void;
  closeProfile: () => void;
  currentParentId: string | null;
  setCurrentParentId: (id: string | null) => void;
  activeSearchId: string | null;
  setActiveSearchId: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      selectedProfile: null,
      isProfileOpen: false,
      openProfile: (profile) => set({ selectedProfile: profile, isProfileOpen: true }),
      closeProfile: () => set({ isProfileOpen: false, selectedProfile: null }),
      currentParentId: null,
      setCurrentParentId: (id) => set({ currentParentId: id }),
      activeSearchId: null,
      setActiveSearchId: (id) => set({ activeSearchId: id }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
