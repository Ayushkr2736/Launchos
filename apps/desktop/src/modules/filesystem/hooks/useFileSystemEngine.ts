import { useCallback, useEffect } from 'react';

import type { FileSystemService, FsWatchEvent } from '@/modules/filesystem/types';

import { fileSystemService } from '@/modules/filesystem/services/create-file-system-service';
import { useFilesystemStore } from '@/modules/filesystem/stores/filesystem-store';

/**
 * Access the File System Engine: service methods + workspace store actions.
 */
export function useFileSystemEngine(): {
  service: FileSystemService;
  workspacePath: string | null;
  workspaceName: string | null;
  status: ReturnType<typeof useFilesystemStore.getState>['status'];
  errorMessage: string | null;
  openFolder: () => Promise<string | null>;
  openFile: ReturnType<typeof useFilesystemStore.getState>['openFile'];
  saveAs: ReturnType<typeof useFilesystemStore.getState>['saveAs'];
  closeFolder: () => void;
  restoreWorkspace: () => Promise<string | null>;
  watchWorkspace: ReturnType<typeof useFilesystemStore.getState>['watchWorkspace'];
  lastWatchEvent: ReturnType<typeof useFilesystemStore.getState>['lastWatchEvent'];
  clearError: () => void;
} {
  const workspacePath = useFilesystemStore((s) => s.workspacePath);
  const workspaceName = useFilesystemStore((s) => s.workspaceName);
  const status = useFilesystemStore((s) => s.status);
  const errorMessage = useFilesystemStore((s) => s.errorMessage);
  const openFolder = useFilesystemStore((s) => s.openFolder);
  const openFile = useFilesystemStore((s) => s.openFile);
  const saveAs = useFilesystemStore((s) => s.saveAs);
  const closeFolder = useFilesystemStore((s) => s.closeFolder);
  const restoreWorkspace = useFilesystemStore((s) => s.restoreWorkspace);
  const watchWorkspace = useFilesystemStore((s) => s.watchWorkspace);
  const lastWatchEvent = useFilesystemStore((s) => s.lastWatchEvent);
  const clearError = useFilesystemStore((s) => s.clearError);

  return {
    service: fileSystemService,
    workspacePath,
    workspaceName,
    status,
    errorMessage,
    openFolder,
    openFile,
    saveAs,
    closeFolder,
    restoreWorkspace,
    watchWorkspace,
    lastWatchEvent,
    clearError,
  };
}

/** Subscribe to the active workspace folder path. */
export function useWorkspaceFolder(): {
  path: string | null;
  name: string | null;
  status: ReturnType<typeof useFilesystemStore.getState>['status'];
  isReady: boolean;
} {
  const path = useFilesystemStore((s) => s.workspacePath);
  const name = useFilesystemStore((s) => s.workspaceName);
  const status = useFilesystemStore((s) => s.status);
  return {
    path,
    name,
    status,
    isReady: status === 'ready' && Boolean(path),
  };
}

/**
 * Watch a path and tear down on unmount / path change.
 * Prefer `watchWorkspace` on the store for the active project root.
 */
export function useFileWatcher(
  path: string | null | undefined,
  onEvent: (event: FsWatchEvent) => void,
  enabled = true,
): void {
  const watchPath = useFilesystemStore((s) => s.watchPath);
  const handler = useCallback(onEvent, [onEvent]);

  useEffect(() => {
    if (!enabled || !path) {
      return;
    }
    let disposed = false;
    let unwatch: (() => void) | undefined;

    void watchPath(path, (event) => {
      if (!disposed) {
        handler(event);
      }
    }).then((fn) => {
      if (disposed) {
        fn();
        return;
      }
      unwatch = fn;
    });

    return () => {
      disposed = true;
      unwatch?.();
    };
  }, [enabled, handler, path, watchPath]);
}
