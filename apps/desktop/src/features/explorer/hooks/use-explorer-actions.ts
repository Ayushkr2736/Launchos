import { confirm } from '@tauri-apps/plugin-dialog';
import { open as shellOpen } from '@tauri-apps/plugin-shell';
import { useCallback } from 'react';

import type { FsNode, FsPath } from '@/features/explorer/fs/types';

import { getFsParentPath, getNativeParentFromNative } from '@/features/explorer/fs/path';
import { suggestNewFileName, suggestNewFolderName } from '@/features/explorer/fs/seed';
import { FileSystemError } from '@/features/explorer/fs/types';
import { useFileSystem } from '@/features/explorer/fs/use-file-system';
import { useWorkspaceManagerStore } from '@/modules/workspace-manager';
import { isFileSystemServiceError } from '@/services/filesystem';
import { useEditorViewStateStore } from '@/stores/editor-view-state-store';
import { useExplorerStore } from '@/stores/explorer-store';
import { useProjectStore } from '@/stores/project-store';
import { useRecentFilesStore } from '@/stores/recent-files-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useWorkspaceStore } from '@/stores/workspace-store';

function toErrorMessage(error: unknown): string {
  if (error instanceof FileSystemError || isFileSystemServiceError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong in the Explorer.';
}

export function useExplorerActions() {
  const fs = useFileSystem();
  const selectPath = useExplorerStore((state) => state.selectPath);
  const expandPath = useExplorerStore((state) => state.expandPath);
  const expandAncestors = useExplorerStore((state) => state.expandAncestors);
  const collapseAll = useExplorerStore((state) => state.collapseAll);
  const setRenamingPath = useExplorerStore((state) => state.setRenamingPath);
  const beginCreate = useExplorerStore((state) => state.beginCreate);
  const cancelCreate = useExplorerStore((state) => state.cancelCreate);
  const remapPath = useExplorerStore((state) => state.remapPath);
  const prunePath = useExplorerStore((state) => state.prunePath);
  const bindProjectRoot = useExplorerStore((state) => state.bindProjectRoot);
  const setLastError = useExplorerStore((state) => state.setLastError);
  const openTab = useWorkspaceStore((state) => state.openTab);
  const remapTabPath = useWorkspaceStore((state) => state.remapTabPath);
  const addRecentFile = useRecentFilesStore((state) => state.addRecentFile);
  const setActiveSection = useSidebarStore((state) => state.setActiveSection);
  const openWorkspace = useWorkspaceManagerStore((state) => state.openWorkspace);
  const closeWorkspace = useWorkspaceManagerStore((state) => state.closeWorkspace);
  const rememberWorkspace = useWorkspaceManagerStore((state) => state.rememberWorkspace);
  const workspacePath = useProjectStore((state) => state.workspacePath);
  const workspaceName = useProjectStore((state) => state.workspaceName);

  const openFile = useCallback(
    (node: FsNode) => {
      if (node.kind !== 'file') {
        return;
      }
      selectPath(node.path);
      openTab({ id: node.path, title: node.name, closable: true, kind: 'file', path: node.path });
      addRecentFile({ id: node.path, name: node.name, path: node.path });
      setActiveSection('code');
    },
    [addRecentFile, openTab, selectPath, setActiveSection],
  );

  const createFile = useCallback(
    async (parentPath: FsPath, name?: string) => {
      const siblings = fs.listChildren(parentPath).map((child) => child.name);
      const finalName = name?.trim() || suggestNewFileName(parentPath, siblings);
      const created = await fs.createFile(parentPath, finalName);
      expandPath(parentPath);
      selectPath(created.path);
      setRenamingPath(null);
      cancelCreate();
      openFile(created);
      return created;
    },
    [cancelCreate, expandPath, fs, openFile, selectPath, setRenamingPath],
  );

  const createFolder = useCallback(
    async (parentPath: FsPath, name?: string) => {
      const siblings = fs.listChildren(parentPath).map((child) => child.name);
      const finalName = name?.trim() || suggestNewFolderName(parentPath, siblings);
      const created = await fs.createFolder(parentPath, finalName);
      expandPath(parentPath);
      expandPath(created.path);
      selectPath(created.path);
      setRenamingPath(null);
      cancelCreate();
      return created;
    },
    [cancelCreate, expandPath, fs, selectPath, setRenamingPath],
  );

  const rename = useCallback(
    async (path: FsPath, nextName: string) => {
      const renamed = await fs.rename(path, nextName.trim());
      remapPath(path, renamed.path);
      remapTabPath(path, renamed.path, renamed.name);
      useEditorViewStateStore.getState().remapId(path, renamed.path);
      selectPath(renamed.path);
      setRenamingPath(null);
      return renamed;
    },
    [fs, remapPath, remapTabPath, selectPath, setRenamingPath],
  );

  const remove = useCallback(
    async (path: FsPath) => {
      const node = fs.getNode(path);
      if (!node || path === '/') {
        return;
      }
      const label =
        node.kind === 'folder' ? `folder '${node.name}' and its contents` : `'${node.name}'`;
      let confirmed = false;
      try {
        confirmed = await confirm(`Are you sure you want to delete ${label}?`, {
          title: 'Delete',
          kind: 'warning',
        });
      } catch {
        confirmed = window.confirm(`Are you sure you want to delete ${label}?`);
      }
      if (!confirmed) {
        return;
      }
      await fs.delete(path);
      prunePath(path);
      useWorkspaceStore.getState().closeTab(path);
      useEditorViewStateStore.getState().clearViewState(path);
    },
    [fs, prunePath],
  );

  const move = useCallback(
    async (path: FsPath, targetFolderPath: FsPath) => {
      const moved = await fs.move(path, targetFolderPath);
      remapPath(path, moved.path);
      remapTabPath(path, moved.path, moved.name);
      useEditorViewStateStore.getState().remapId(path, moved.path);
      expandPath(targetFolderPath);
      expandAncestors(moved.path);
      selectPath(moved.path);
      return moved;
    },
    [expandAncestors, expandPath, fs, remapPath, remapTabPath, selectPath],
  );

  const startRename = useCallback(
    (path: FsPath) => {
      setRenamingPath(path);
      selectPath(path);
    },
    [selectPath, setRenamingPath],
  );

  const startCreate = useCallback(
    (parentPath: FsPath, kind: 'file' | 'folder') => {
      const target =
        fs.getNode(parentPath)?.kind === 'folder'
          ? parentPath
          : (getFsParentPath(parentPath) ?? fs.getRootPath());
      beginCreate(target, kind);
      selectPath(target);
    },
    [beginCreate, fs, selectPath],
  );

  const copyPath = useCallback(
    async (path: FsPath, relative = false) => {
      const native = fs.resolveNativePath(path);
      const text = relative ? (path === '/' ? '.' : path.replace(/^\//, '')) : (native ?? path);
      await navigator.clipboard.writeText(text);
    },
    [fs],
  );

  const revealInOs = useCallback(
    async (path: FsPath) => {
      const native = fs.resolveNativePath(path);
      if (!native) {
        setLastError('This path cannot be revealed outside the app.');
        return;
      }
      const node = fs.getNode(path);
      const target =
        node?.kind === 'folder' ? native : (getNativeParentFromNative(native) ?? native);
      await shellOpen(target);
    },
    [fs, setLastError],
  );

  const openProjectFolder = useCallback(async () => {
    const entry = await openWorkspace();
    if (!entry) {
      return null;
    }
    bindProjectRoot(entry.path);
    setActiveSection('code');
    return entry.path;
  }, [bindProjectRoot, openWorkspace, setActiveSection]);

  const closeProjectFolder = useCallback(() => {
    closeWorkspace();
    bindProjectRoot(null);
  }, [bindProjectRoot, closeWorkspace]);

  const revealInSidebar = useCallback(() => {
    if (!workspacePath) {
      return;
    }
    rememberWorkspace(workspacePath, workspaceName ?? undefined);
    setActiveSection('projects');
  }, [rememberWorkspace, setActiveSection, workspaceName, workspacePath]);

  const safeRun = useCallback(
    (action: () => void | Promise<unknown>) => {
      void (async () => {
        try {
          setLastError(null);
          await action();
        } catch (error) {
          const message = toErrorMessage(error);
          setLastError(message);
          console.warn('[explorer]', error);
        }
      })();
    },
    [setLastError],
  );

  return {
    openFile,
    createFile,
    createFolder,
    rename,
    remove,
    move,
    startRename,
    startCreate,
    cancelCreate,
    copyPath,
    revealInOs,
    collapseAll,
    openProjectFolder,
    closeProjectFolder,
    revealInSidebar,
    safeRun,
  };
}
