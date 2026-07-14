import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { NativeFsPath } from '@/modules/filesystem';

import { layoutPanelApi } from '@/layout/panel-api';
import { useFilesystemStore } from '@/modules/filesystem';
import {
  WORKSPACE_MANAGER_STORAGE_KEY,
  WORKSPACE_PINNED_MAX,
  WORKSPACE_RECENT_MAX,
} from '@/modules/workspace-manager/constants';
import {
  createWorkspaceEntry,
  resolveWorkspaceMetadata,
  toWorkspaceId,
  upsertPinnedList,
  upsertRecentList,
} from '@/modules/workspace-manager/services/workspace-service';
import {
  DEFAULT_WORKSPACE_SETTINGS,
  type WorkspaceEntry,
  type WorkspaceId,
  type WorkspaceManagerStatus,
  type WorkspaceMetadata,
  type WorkspaceSettings,
} from '@/modules/workspace-manager/types';

export interface WorkspaceManagerStoreState {
  recents: WorkspaceEntry[];
  pinned: WorkspaceEntry[];
  activeWorkspaceId: WorkspaceId | null;
  status: WorkspaceManagerStatus;
  errorMessage: string | null;
  settingsByPath: Record<string, WorkspaceSettings>;
  metadataByPath: Record<string, WorkspaceMetadata>;
  /** One-shot flag: sidebar recents were imported into this store. */
  migratedFromSidebar: boolean;

  /** Open folder dialog, activate FS workspace, record recent. */
  openWorkspace: () => Promise<WorkspaceEntry | null>;
  /** Switch to an existing path (recent / pinned / restore). */
  switchWorkspace: (path: NativeFsPath) => Promise<WorkspaceEntry | null>;
  /** Restore preferred or last filesystem workspace and sync catalog. */
  restoreLastWorkspace: () => Promise<WorkspaceEntry | null>;
  /** Close active folder (keeps last path for restore). */
  closeWorkspace: () => void;

  rememberWorkspace: (path: NativeFsPath, name?: string) => WorkspaceEntry;
  pinWorkspace: (id: WorkspaceId) => void;
  unpinWorkspace: (id: WorkspaceId) => void;
  togglePinned: (id: WorkspaceId) => void;
  removeRecent: (id: WorkspaceId) => void;
  clearRecents: () => void;
  updateSettings: (path: NativeFsPath, patch: Partial<WorkspaceSettings>) => void;
  getSettings: (path: NativeFsPath) => WorkspaceSettings;
  refreshMetadata: (path: NativeFsPath) => Promise<WorkspaceMetadata>;
  importLegacyRecents: (
    projects: ReadonlyArray<{ id: string; name: string; path?: string; openedAt: number }>,
  ) => void;
  clearError: () => void;
}

function applyOpenSideEffects(path: NativeFsPath, settings: WorkspaceSettings): void {
  if (settings.expandExplorerOnOpen) {
    layoutPanelApi.expand('explorer');
  }
}

function findPreferredLaunchPath(state: WorkspaceManagerStoreState): NativeFsPath | null {
  for (const entry of state.pinned) {
    const settings = {
      ...DEFAULT_WORKSPACE_SETTINGS,
      ...state.settingsByPath[entry.id],
    };
    if (settings.preferOnLaunch) {
      return entry.path;
    }
  }
  return null;
}

export const useWorkspaceManagerStore = create<WorkspaceManagerStoreState>()(
  persist(
    (set, get) => ({
      recents: [],
      pinned: [],
      activeWorkspaceId: null,
      status: 'idle',
      errorMessage: null,
      settingsByPath: {},
      metadataByPath: {},
      migratedFromSidebar: false,

      openWorkspace: async () => {
        set({ status: 'switching', errorMessage: null });
        const path = await useFilesystemStore.getState().openFolder();
        if (!path) {
          set({
            status: useFilesystemStore.getState().workspacePath ? 'ready' : 'idle',
          });
          return null;
        }
        const entry = get().rememberWorkspace(path);
        set({ activeWorkspaceId: entry.id, status: 'ready' });
        applyOpenSideEffects(path, get().getSettings(path));
        void get().refreshMetadata(path);
        return entry;
      },

      switchWorkspace: async (path) => {
        set({ status: 'switching', errorMessage: null });
        const opened = await useFilesystemStore.getState().openPath(path);
        if (!opened) {
          const fsError = useFilesystemStore.getState().errorMessage;
          set({
            status: 'error',
            errorMessage: fsError ?? 'Failed to switch workspace.',
          });
          return null;
        }
        const entry = get().rememberWorkspace(opened);
        set({ activeWorkspaceId: entry.id, status: 'ready', errorMessage: null });
        applyOpenSideEffects(opened, get().getSettings(opened));
        void get().refreshMetadata(opened);
        return entry;
      },

      restoreLastWorkspace: async () => {
        set({ status: 'switching', errorMessage: null });
        const preferred = findPreferredLaunchPath(get());
        if (preferred) {
          const switched = await get().switchWorkspace(preferred);
          if (switched) {
            return switched;
          }
        }

        const path = await useFilesystemStore.getState().restoreWorkspace();
        if (!path) {
          const fs = useFilesystemStore.getState();
          set({
            status: fs.errorMessage ? 'error' : 'idle',
            errorMessage: fs.errorMessage,
            activeWorkspaceId: null,
          });
          return null;
        }
        const entry = get().rememberWorkspace(path);
        set({ activeWorkspaceId: entry.id, status: 'ready', errorMessage: null });
        applyOpenSideEffects(path, get().getSettings(path));
        void get().refreshMetadata(path);
        return entry;
      },

      closeWorkspace: () => {
        useFilesystemStore.getState().closeFolder();
        set({ activeWorkspaceId: null, status: 'idle', errorMessage: null });
      },

      rememberWorkspace: (path, name) => {
        const entry = createWorkspaceEntry(path, name !== undefined ? { name } : undefined);
        set((state) => {
          const pinnedMatch = state.pinned.find((item) => item.id === entry.id);
          const nextEntry: WorkspaceEntry = pinnedMatch
            ? { ...entry, pinnedAt: pinnedMatch.pinnedAt, openedAt: pinnedMatch.openedAt }
            : entry;
          return {
            recents: upsertRecentList(state.recents, nextEntry, WORKSPACE_RECENT_MAX),
            pinned: pinnedMatch
              ? state.pinned.map((item) => (item.id === nextEntry.id ? nextEntry : item))
              : state.pinned,
          };
        });
        return get().recents.find((item) => item.id === entry.id) ?? entry;
      },

      pinWorkspace: (id) => {
        const state = get();
        const fromRecent = state.recents.find((item) => item.id === id);
        const existing = state.pinned.find((item) => item.id === id) ?? fromRecent;
        if (!existing) {
          return;
        }
        const pinnedEntry = { ...existing, pinnedAt: Date.now() };
        set({
          pinned: upsertPinnedList(state.pinned, pinnedEntry, WORKSPACE_PINNED_MAX),
          recents: state.recents.map((item) =>
            item.id === id ? { ...item, pinnedAt: pinnedEntry.pinnedAt } : item,
          ),
        });
      },

      unpinWorkspace: (id) => {
        set((state) => ({
          pinned: state.pinned.filter((item) => item.id !== id),
          recents: state.recents.map((item) =>
            item.id === id ? { ...item, pinnedAt: null } : item,
          ),
        }));
      },

      togglePinned: (id) => {
        if (get().pinned.some((item) => item.id === id)) {
          get().unpinWorkspace(id);
          return;
        }
        get().pinWorkspace(id);
      },

      removeRecent: (id) => {
        set((state) => ({
          recents: state.recents.filter((item) => item.id !== id),
        }));
      },

      clearRecents: () => {
        set({ recents: [] });
      },

      updateSettings: (path, patch) => {
        const id = toWorkspaceId(path);
        set((state) => ({
          settingsByPath: {
            ...state.settingsByPath,
            [id]: {
              ...DEFAULT_WORKSPACE_SETTINGS,
              ...state.settingsByPath[id],
              ...patch,
            },
          },
        }));
      },

      getSettings: (path) => {
        const id = toWorkspaceId(path);
        return {
          ...DEFAULT_WORKSPACE_SETTINGS,
          ...get().settingsByPath[id],
        };
      },

      refreshMetadata: async (path) => {
        const meta = await resolveWorkspaceMetadata(path);
        set((state) => ({
          metadataByPath: {
            ...state.metadataByPath,
            [meta.path]: meta,
          },
        }));
        return meta;
      },

      importLegacyRecents: (projects) => {
        if (get().migratedFromSidebar || projects.length === 0) {
          if (!get().migratedFromSidebar) {
            set({ migratedFromSidebar: true });
          }
          return;
        }
        if (get().recents.length > 0) {
          set({ migratedFromSidebar: true });
          return;
        }
        const imported = projects
          .map((project) =>
            createWorkspaceEntry(project.path ?? project.id, {
              name: project.name,
              openedAt: project.openedAt,
            }),
          )
          .map((entry) => ({
            ...entry,
            lastOpenedAt: entry.openedAt,
          }));
        set({
          recents: imported.slice(0, WORKSPACE_RECENT_MAX),
          migratedFromSidebar: true,
        });
      },

      clearError: () => {
        set({
          errorMessage: null,
          status: get().activeWorkspaceId ? 'ready' : 'idle',
        });
      },
    }),
    {
      name: WORKSPACE_MANAGER_STORAGE_KEY,
      partialize: (state) => ({
        recents: state.recents,
        pinned: state.pinned,
        settingsByPath: state.settingsByPath,
        metadataByPath: state.metadataByPath,
        migratedFromSidebar: state.migratedFromSidebar,
      }),
    },
  ),
);

export const WorkspaceStore = useWorkspaceManagerStore;
