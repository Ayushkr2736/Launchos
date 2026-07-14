import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { FileSystemServiceErrorCode } from '@/modules/filesystem/services/errors';
import type {
  FsUnwatchFn,
  FsWatchEvent,
  NativeFsPath,
  OpenFileOptions,
  SaveAsOptions,
  WatchPathOptions,
  WorkspaceStatus,
} from '@/modules/filesystem/types';

import { fileSystemService } from '@/modules/filesystem/services/create-file-system-service';
import {
  describeWorkspaceError,
  isFileSystemServiceError,
  workspaceErrorCode,
} from '@/modules/filesystem/services/errors';
import { getNativeBaseName } from '@/modules/filesystem/services/path';
import { assertWorkspaceAccessible } from '@/modules/filesystem/services/workspace-access';

export const FILESYSTEM_STORAGE_KEY = 'launchos.project';

interface PersistedFilesystemState {
  lastWorkspacePath?: NativeFsPath | null;
  workspaceName?: string | null;
  /** @deprecated migrated → lastWorkspacePath */
  rootPath?: NativeFsPath | null;
  /** @deprecated migrated → workspaceName */
  rootName?: string | null;
}

export interface FilesystemStoreState {
  /** Persisted path of the last opened workspace. */
  lastWorkspacePath: NativeFsPath | null;
  /** Active workspace loaded into the File Explorer. */
  workspacePath: NativeFsPath | null;
  workspaceName: string | null;
  status: WorkspaceStatus;
  errorMessage: string | null;
  errorCode: FileSystemServiceErrorCode | null;
  /** Paths currently watched by the engine. */
  watchedPaths: readonly NativeFsPath[];
  /** Most recent watch event (for UI refresh subscribers). */
  lastWatchEvent: FsWatchEvent | null;
  /** Open native folder picker, validate access, then activate workspace. */
  openFolder: () => Promise<NativeFsPath | null>;
  /** Activate an existing folder path without a dialog (workspace switch). */
  openPath: (path: NativeFsPath) => Promise<NativeFsPath | null>;
  /** Open a single file via native dialog (does not change workspace). */
  openFile: (options?: OpenFileOptions) => Promise<NativeFsPath | null>;
  /** Save-as dialog + write. */
  saveAs: (content: string, options?: SaveAsOptions) => Promise<NativeFsPath | null>;
  /** Re-validate and activate `lastWorkspacePath` after app launch. */
  restoreWorkspace: () => Promise<NativeFsPath | null>;
  /**
   * Close the active folder.
   * Keeps `lastWorkspacePath` so Restore Last Workspace still works.
   */
  closeFolder: () => void;
  clearError: () => void;
  /** Watch the active workspace recursively. */
  watchWorkspace: (options?: WatchPathOptions) => Promise<void>;
  /** Watch an arbitrary path. */
  watchPath: (
    path: NativeFsPath,
    onEvent?: (event: FsWatchEvent) => void,
    options?: WatchPathOptions,
  ) => Promise<FsUnwatchFn>;
  unwatchAll: () => void;
}

function activateWorkspace(
  path: NativeFsPath,
): Pick<
  FilesystemStoreState,
  'lastWorkspacePath' | 'workspacePath' | 'workspaceName' | 'status' | 'errorMessage' | 'errorCode'
> {
  return {
    lastWorkspacePath: path,
    workspacePath: path,
    workspaceName: getNativeBaseName(path),
    status: 'ready',
    errorMessage: null,
    errorCode: null,
  };
}

function failWorkspace(
  error: unknown,
): Pick<
  FilesystemStoreState,
  'workspacePath' | 'workspaceName' | 'status' | 'errorMessage' | 'errorCode'
> {
  return {
    workspacePath: null,
    workspaceName: null,
    status: 'error',
    errorMessage: describeWorkspaceError(error),
    errorCode: workspaceErrorCode(error),
  };
}

const activeUnwatchers = new Map<string, FsUnwatchFn>();

export const useFilesystemStore = create<FilesystemStoreState>()(
  persist(
    (set, get) => ({
      lastWorkspacePath: null,
      workspacePath: null,
      workspaceName: null,
      status: 'idle',
      errorMessage: null,
      errorCode: null,
      watchedPaths: [],
      lastWatchEvent: null,

      openFolder: async () => {
        set({ status: 'opening', errorMessage: null, errorCode: null });
        try {
          const selected = await fileSystemService.openFolder({
            title: 'Open Folder',
          });
          if (!selected) {
            const previous = get().workspacePath;
            set({
              status: previous ? 'ready' : 'idle',
              errorMessage: null,
              errorCode: null,
            });
            return null;
          }

          return await get().openPath(selected);
        } catch (error) {
          if (isFileSystemServiceError(error) && error.code === 'CANCELLED') {
            const previous = get().workspacePath;
            set({
              status: previous ? 'ready' : 'idle',
              errorMessage: null,
              errorCode: null,
            });
            return null;
          }
          set(failWorkspace(error));
          return null;
        }
      },

      openPath: async (path) => {
        set({ status: 'opening', errorMessage: null, errorCode: null });
        try {
          await assertWorkspaceAccessible(fileSystemService, path);
          get().unwatchAll();
          set(activateWorkspace(path));
          void get().watchWorkspace();
          return path;
        } catch (error) {
          set(failWorkspace(error));
          return null;
        }
      },

      openFile: async (options) => {
        try {
          return await fileSystemService.openFile({
            title: 'Open File',
            ...options,
          });
        } catch (error) {
          set({
            errorMessage: isFileSystemServiceError(error) ? error.message : 'Failed to open file.',
            errorCode: workspaceErrorCode(error),
          });
          return null;
        }
      },

      saveAs: async (content, options) => {
        try {
          return await fileSystemService.saveAs(content, {
            title: 'Save As',
            ...options,
          });
        } catch (error) {
          set({
            errorMessage: isFileSystemServiceError(error) ? error.message : 'Failed to save file.',
            errorCode: workspaceErrorCode(error),
          });
          return null;
        }
      },

      restoreWorkspace: async () => {
        const path = get().lastWorkspacePath;
        if (!path) {
          set({
            workspacePath: null,
            workspaceName: null,
            status: 'idle',
            errorMessage: null,
            errorCode: null,
          });
          return null;
        }

        set({ status: 'restoring', errorMessage: null, errorCode: null });
        try {
          await assertWorkspaceAccessible(fileSystemService, path);
          get().unwatchAll();
          set(activateWorkspace(path));
          void get().watchWorkspace();
          return path;
        } catch (error) {
          set({
            ...failWorkspace(error),
            lastWorkspacePath: path,
          });
          return null;
        }
      },

      closeFolder: () => {
        get().unwatchAll();
        set({
          // Keep lastWorkspacePath + workspaceName for Restore Last Workspace.
          workspacePath: null,
          status: 'idle',
          errorMessage: null,
          errorCode: null,
          lastWatchEvent: null,
        });
      },

      clearError: () => {
        set({
          errorMessage: null,
          errorCode: null,
          status: get().workspacePath ? 'ready' : 'idle',
        });
      },

      watchWorkspace: async (options) => {
        const path = get().workspacePath;
        if (!path) {
          return;
        }
        try {
          await get().watchPath(path, undefined, { recursive: true, delayMs: 300, ...options });
        } catch (error) {
          // Non-fatal: tree still works; live refresh may be unavailable.
          console.warn('[filesystem] watch failed', error);
          set({
            errorMessage: isFileSystemServiceError(error)
              ? `Folder opened, but file watching failed: ${error.message}`
              : 'Folder opened, but file watching failed.',
            errorCode: workspaceErrorCode(error) ?? 'WATCH_ERROR',
            // Keep workspace ready — watch failure must not unload the tree.
            status: 'ready',
          });
        }
      },

      watchPath: async (path, onEvent, options) => {
        const existing = activeUnwatchers.get(path);
        existing?.();

        const unwatch = await fileSystemService.watch(
          path,
          (event) => {
            set({ lastWatchEvent: event });
            onEvent?.(event);
          },
          options,
        );

        activeUnwatchers.set(path, unwatch);
        set({ watchedPaths: Array.from(activeUnwatchers.keys()) });

        return () => {
          unwatch();
          activeUnwatchers.delete(path);
          set({ watchedPaths: Array.from(activeUnwatchers.keys()) });
        };
      },

      unwatchAll: () => {
        for (const unwatch of activeUnwatchers.values()) {
          try {
            unwatch();
          } catch {
            // ignore
          }
        }
        activeUnwatchers.clear();
        set({ watchedPaths: [], lastWatchEvent: null });
      },
    }),
    {
      name: FILESYSTEM_STORAGE_KEY,
      partialize: (state) => ({
        lastWorkspacePath: state.lastWorkspacePath,
        workspaceName: state.workspaceName,
      }),
      merge: (persisted, current) => {
        const raw = (persisted ?? {}) as PersistedFilesystemState;
        const lastWorkspacePath = raw.lastWorkspacePath ?? raw.rootPath ?? null;
        const workspaceName = raw.workspaceName ?? raw.rootName ?? null;
        return {
          ...current,
          lastWorkspacePath,
          workspaceName,
          workspacePath: null,
          status: lastWorkspacePath ? 'restoring' : 'idle',
        };
      },
    },
  ),
);

/** Alias matching the module contract. */
export const FilesystemStore = useFilesystemStore;
