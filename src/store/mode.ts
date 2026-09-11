import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mode } from '../types/product.type';

interface ModeState {
  selectedMode: Mode | null;
  setSelectedMode: (mode: Mode) => void;
  clearSelectedMode: () => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      selectedMode: null,
      setSelectedMode: (mode: Mode) => set({ selectedMode: mode }),
      clearSelectedMode: () => set({ selectedMode: null }),
    }),
    {
      name: 'tanggy-mode-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
