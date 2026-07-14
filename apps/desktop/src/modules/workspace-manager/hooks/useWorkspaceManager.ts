import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { NativeFsPath } from '@/modules/filesystem';
import type {
  WorkspaceEntry,
  WorkspaceId,
  WorkspaceMetadata,
  WorkspaceSettings,
} from '@/modules/workspace-manager/types';

import { useFilesystemStore } from '@/modules/filesystem';
import { useWorkspaceManagerStore } from '@/modules/workspace-manager/stores/workspace-manager-store';
import { DEFAULT_WORKSPACE_SETTINGS } from '@/modules/workspace-manager/types';
import { useSidebarStore } from '@/stores/sidebar-store';

/**
 * Primary Workspace Manager API for React surfaces.
 */
export function useWorkspaceManager() {
  const recents = useWorkspaceManagerStore((s) => s.recents);
  const pinned = useWorkspaceManagerStore((s) => s.pinned);
  const activeWorkspaceId = useWorkspaceManagerStore((s) => s.activeWorkspaceId);
  const status = useWorkspaceManagerStore((s) => s.status);
  const errorMessage = useWorkspaceManagerStore((s) => s.errorMessage);
  const openWorkspace = useWorkspaceManagerStore((s) => s.openWorkspace);
  const switchWorkspace = useWorkspaceManagerStore((s) => s.switchWorkspace);
  const restoreLastWorkspace = useWorkspaceManagerStore((s) => s.restoreLastWorkspace);
  const closeWorkspace = useWorkspaceManagerStore((s) => s.closeWorkspace);
  const pinWorkspace = useWorkspaceManagerStore((s) => s.pinWorkspace);
  const unpinWorkspace = useWorkspaceManagerStore((s) => s.unpinWorkspace);
  const togglePinned = useWorkspaceManagerStore((s) => s.togglePinned);
  const removeRecent = useWorkspaceManagerStore((s) => s.removeRecent);
  const clearRecents = useWorkspaceManagerStore((s) => s.clearRecents);
  const updateSettings = useWorkspaceManagerStore((s) => s.updateSettings);
  const getSettings = useWorkspaceManagerStore((s) => s.getSettings);
  const refreshMetadata = useWorkspaceManagerStore((s) => s.refreshMetadata);
  const clearError = useWorkspaceManagerStore((s) => s.clearError);
  const workspacePath = useFilesystemStore((s) => s.workspacePath);
  const workspaceName = useFilesystemStore((s) => s.workspaceName);

  const isPinned = useCallback(
    (id: WorkspaceId) => pinned.some((item) => item.id === id),
    [pinned],
  );

  return {
    recents,
    pinned,
    activeWorkspaceId,
    status,
    errorMessage,
    workspacePath,
    workspaceName,
    openWorkspace,
    switchWorkspace,
    restoreLastWorkspace,
    closeWorkspace,
    pinWorkspace,
    unpinWorkspace,
    togglePinned,
    isPinned,
    removeRecent,
    clearRecents,
    updateSettings,
    getSettings,
    refreshMetadata,
    clearError,
  };
}

/** Active workspace entry + metadata (if catalogued). */
export function useActiveWorkspace(): {
  entry: WorkspaceEntry | null;
  metadata: WorkspaceMetadata | null;
  settings: WorkspaceSettings;
  path: NativeFsPath | null;
} {
  const activeWorkspaceId = useWorkspaceManagerStore((s) => s.activeWorkspaceId);
  const recents = useWorkspaceManagerStore((s) => s.recents);
  const pinned = useWorkspaceManagerStore((s) => s.pinned);
  const metadataByPath = useWorkspaceManagerStore((s) => s.metadataByPath);
  const getSettings = useWorkspaceManagerStore((s) => s.getSettings);
  const workspacePath = useFilesystemStore((s) => s.workspacePath);

  return useMemo(() => {
    const path = workspacePath;
    const entry =
      (activeWorkspaceId
        ? (pinned.find((item) => item.id === activeWorkspaceId) ??
          recents.find((item) => item.id === activeWorkspaceId))
        : null) ??
      (path
        ? (pinned.find((item) => item.id === path) ?? recents.find((item) => item.id === path))
        : null) ??
      null;
    const resolvedPath = entry?.path ?? path;
    return {
      entry,
      metadata: resolvedPath ? (metadataByPath[resolvedPath] ?? null) : null,
      settings: resolvedPath ? getSettings(resolvedPath) : DEFAULT_WORKSPACE_SETTINGS,
      path: resolvedPath,
    };
  }, [activeWorkspaceId, getSettings, metadataByPath, pinned, recents, workspacePath]);
}

/** Settings for a specific workspace path. */
export function useWorkspaceSettings(path: NativeFsPath | null | undefined): {
  settings: WorkspaceSettings;
  updateSettings: (patch: Partial<WorkspaceSettings>) => void;
} {
  const settingsByPath = useWorkspaceManagerStore((s) => s.settingsByPath);
  const updateSettings = useWorkspaceManagerStore((s) => s.updateSettings);
  const getSettings = useWorkspaceManagerStore((s) => s.getSettings);

  const settings = useMemo(
    () => (path ? getSettings(path) : DEFAULT_WORKSPACE_SETTINGS),
    // settingsByPath invalidates when persisted settings change
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
    [getSettings, path, settingsByPath],
  );

  return {
    settings,
    updateSettings: useCallback(
      (patch: Partial<WorkspaceSettings>) => {
        if (!path) {
          return;
        }
        updateSettings(path, patch);
      },
      [path, updateSettings],
    ),
  };
}

/**
 * After persistence hydrates, restore the last (or preferred) workspace.
 * Also migrates legacy sidebar recents once.
 */
export function useRestoreLastWorkspace(): void {
  const restoreLastWorkspace = useWorkspaceManagerStore((s) => s.restoreLastWorkspace);
  const importLegacyRecents = useWorkspaceManagerStore((s) => s.importLegacyRecents);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }

    const run = () => {
      if (started.current) {
        return;
      }
      started.current = true;

      const migrateThenRestore = () => {
        const legacy = useSidebarStore.getState().recentProjects;
        importLegacyRecents(legacy);
        void restoreLastWorkspace();
      };

      const waitForSidebar = (then: () => void) => {
        if (useSidebarStore.persist.hasHydrated()) {
          then();
          return;
        }
        const unsub = useSidebarStore.persist.onFinishHydration(() => {
          unsub();
          then();
        });
      };

      if (useWorkspaceManagerStore.persist.hasHydrated()) {
        waitForSidebar(migrateThenRestore);
        return;
      }

      return useWorkspaceManagerStore.persist.onFinishHydration(() => {
        waitForSidebar(migrateThenRestore);
      });
    };

    return run();
  }, [importLegacyRecents, restoreLastWorkspace]);
}

/** Catalog lists for sidebar / command palette. */
export function useWorkspaceCatalog(): {
  recents: WorkspaceEntry[];
  pinned: WorkspaceEntry[];
  activeWorkspaceId: WorkspaceId | null;
} {
  const recents = useWorkspaceManagerStore((s) => s.recents);
  const pinned = useWorkspaceManagerStore((s) => s.pinned);
  const activeWorkspaceId = useWorkspaceManagerStore((s) => s.activeWorkspaceId);
  return { recents, pinned, activeWorkspaceId };
}
