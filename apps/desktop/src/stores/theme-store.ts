import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ThemeMode } from '@/theme/types';

import { THEME_MODE_ORDER, THEME_STORAGE_KEY } from '@/theme/tokens';

export interface ThemeStoreState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
}

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode) => {
        set({ mode });
      },
      cycleMode: () => {
        const current = get().mode;
        const index = THEME_MODE_ORDER.indexOf(current);
        const next = THEME_MODE_ORDER[(index + 1) % THEME_MODE_ORDER.length] ?? 'system';
        set({ mode: next });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);
