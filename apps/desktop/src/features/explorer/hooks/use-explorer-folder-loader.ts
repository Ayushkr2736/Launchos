import { useEffect, useRef } from 'react';

import type { FsPath } from '@/features/explorer/fs/types';

import { FileSystemError } from '@/features/explorer/fs/types';
import { useFileSystem } from '@/features/explorer/fs/use-file-system';
import { isFileSystemServiceError, useFilesystemStore } from '@/modules/filesystem';
import { useExplorerStore } from '@/stores/explorer-store';

function toConnectionError(error: unknown): string {
  if (error instanceof FileSystemError) {
    if (error.code === 'PERMISSION_DENIED') {
      return (
        error.message ||
        'Permission denied. Choose a folder under Home, Documents, Desktop, or Downloads.'
      );
    }
    return error.message;
  }
  if (isFileSystemServiceError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Failed to read the folder from disk.';
}

async function loadPaths(
  paths: readonly FsPath[],
  loadFolder: (path: FsPath) => Promise<void>,
  options?: { failConnectionOnError?: boolean },
): Promise<boolean> {
  const unique = [...new Set(paths)];
  useExplorerStore.getState().setLoadingPaths(unique);
  let ok = true;
  try {
    await Promise.all(
      unique.map(async (path) => {
        try {
          await loadFolder(path);
        } catch (error) {
          ok = false;
          useExplorerStore.getState().setLastError(toConnectionError(error));
          if (options?.failConnectionOnError) {
            useExplorerStore.getState().setConnectionStatus('error');
          }
        }
      }),
    );
  } finally {
    useExplorerStore.getState().setLoadingPaths([]);
  }
  return ok;
}

/**
 * Connects Explorer UI to the File System provider:
 * generates the tree (lazy loads), indexes for filter, refreshes on watch,
 * and surfaces loading / permission errors.
 */
export function useExplorerFolderLoader(): void {
  const fs = useFileSystem();
  const expandedPaths = useExplorerStore((state) => state.expandedPaths);
  const searchQuery = useExplorerStore((state) => state.searchQuery);
  const lastWatchEvent = useFilesystemStore((state) => state.lastWatchEvent);
  const workspacePath = useFilesystemStore((state) => state.workspacePath);
  const indexGeneration = useRef(0);

  // Root tree generation when a workspace (provider) becomes active.
  useEffect(() => {
    if (!workspacePath || fs.id === 'mock') {
      useExplorerStore.getState().setConnectionStatus('idle');
      return;
    }

    let cancelled = false;
    useExplorerStore.getState().setConnectionStatus('loading');
    useExplorerStore.getState().clearError();

    void (async () => {
      const ok = await loadPaths(
        ['/', ...useExplorerStore.getState().expandedPaths],
        (path) => fs.loadFolder(path),
        { failConnectionOnError: true },
      );
      if (!cancelled && ok && useExplorerStore.getState().connectionStatus !== 'error') {
        useExplorerStore.getState().setConnectionStatus('ready');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fs, workspacePath]);

  // Expand → load children for newly expanded folders.
  useEffect(() => {
    if (!workspacePath || fs.id === 'mock') {
      return;
    }

    let cancelled = false;
    void (async () => {
      const status = useExplorerStore.getState().connectionStatus;
      // Avoid racing the bootstrap effect; it already loads expanded paths.
      if (status === 'loading') {
        return;
      }
      await loadPaths(expandedPaths, (path) => fs.loadFolder(path));
      if (
        !cancelled &&
        useExplorerStore.getState().connectionStatus !== 'error' &&
        useExplorerStore.getState().connectionStatus !== 'indexing'
      ) {
        useExplorerStore.getState().setConnectionStatus('ready');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [expandedPaths, fs, workspacePath]);

  // Filter → index tree with progress.
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || !workspacePath || fs.id === 'mock') {
      useExplorerStore.getState().setIndexProgress(null);
      if (useExplorerStore.getState().connectionStatus === 'indexing') {
        useExplorerStore.getState().setConnectionStatus('ready');
      }
      return;
    }

    const generation = ++indexGeneration.current;
    let cancelled = false;
    useExplorerStore.getState().setConnectionStatus('indexing');
    useExplorerStore.getState().setIndexProgress({ scannedFolders: 0, pendingFolders: 0 });

    void (async () => {
      try {
        await fs.indexTree('/', 0, (progress) => {
          if (cancelled || indexGeneration.current !== generation) {
            return;
          }
          useExplorerStore.getState().setIndexProgress(progress);
        });
        if (!cancelled && indexGeneration.current === generation) {
          useExplorerStore.getState().setConnectionStatus('ready');
          useExplorerStore.getState().setIndexProgress(null);
        }
      } catch (error) {
        if (!cancelled && indexGeneration.current === generation) {
          useExplorerStore.getState().setLastError(toConnectionError(error));
          useExplorerStore.getState().setConnectionStatus('error');
          useExplorerStore.getState().setIndexProgress(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fs, searchQuery, workspacePath]);

  // Disk watch → refresh expanded tree.
  useEffect(() => {
    if (!lastWatchEvent || !workspacePath || fs.id === 'mock') {
      return;
    }
    void loadPaths(['/', ...useExplorerStore.getState().expandedPaths], (path) =>
      fs.loadFolder(path),
    );
  }, [fs, lastWatchEvent, workspacePath]);
}
