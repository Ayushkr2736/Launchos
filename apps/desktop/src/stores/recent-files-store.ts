import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CommandPaletteRecentFile } from '@/features/command-palette/types';

import {
  COMMAND_PALETTE_RECENT_FILES_MAX,
  RECENT_FILES_STORAGE_KEY,
} from '@/features/command-palette/constants';

export interface RecentFilesStoreState {
  files: CommandPaletteRecentFile[];
  addRecentFile: (file: Omit<CommandPaletteRecentFile, 'openedAt'> & { openedAt?: number }) => void;
  removeRecentFile: (fileId: string) => void;
  clearRecentFiles: () => void;
}

export const useRecentFilesStore = create<RecentFilesStoreState>()(
  persist(
    (set, get) => ({
      files: [],
      addRecentFile: (file) => {
        const next: CommandPaletteRecentFile = {
          id: file.id,
          name: file.name,
          path: file.path,
          openedAt: file.openedAt ?? Date.now(),
        };
        const filtered = get().files.filter((item) => item.id !== next.id);
        set({ files: [next, ...filtered].slice(0, COMMAND_PALETTE_RECENT_FILES_MAX) });
      },
      removeRecentFile: (fileId) => {
        set({ files: get().files.filter((file) => file.id !== fileId) });
      },
      clearRecentFiles: () => {
        set({ files: [] });
      },
    }),
    {
      name: RECENT_FILES_STORAGE_KEY,
      partialize: (state) => ({ files: state.files }),
    },
  ),
);
