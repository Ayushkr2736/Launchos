import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { DesktopWindowState } from '@/window/types';

import {
  WINDOW_DEFAULT_HEIGHT,
  WINDOW_DEFAULT_WIDTH,
  WINDOW_STORAGE_KEY,
} from '@/window/constants';

interface WindowStoreState extends DesktopWindowState {
  setIsTauri: (value: boolean) => void;
  setMaximized: (value: boolean) => void;
  setMinimized: (value: boolean) => void;
  setFocused: (value: boolean) => void;
  setSize: (width: number, height: number) => void;
  setScaleFactor: (scaleFactor: number) => void;
  hydrateFromNative: (partial: Partial<DesktopWindowState>) => void;
}

export const useWindowStore = create<WindowStoreState>()(
  persist(
    (set) => ({
      isTauri: false,
      isMaximized: false,
      isMinimized: false,
      isFocused: true,
      width: WINDOW_DEFAULT_WIDTH,
      height: WINDOW_DEFAULT_HEIGHT,
      scaleFactor: 1,
      setIsTauri: (value) => {
        set({ isTauri: value });
      },
      setMaximized: (value) => {
        set({ isMaximized: value });
      },
      setMinimized: (value) => {
        set({ isMinimized: value });
      },
      setFocused: (value) => {
        set({ isFocused: value });
      },
      setSize: (width, height) => {
        set({ width, height });
      },
      setScaleFactor: (scaleFactor) => {
        set({ scaleFactor });
      },
      hydrateFromNative: (partial) => {
        set(partial);
      },
    }),
    {
      name: WINDOW_STORAGE_KEY,
      partialize: (state) => ({
        isMaximized: state.isMaximized,
        width: state.width,
        height: state.height,
      }),
    },
  ),
);
