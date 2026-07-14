import { useCallback, useState, type DragEvent } from 'react';

import type { FsPath } from '@/features/explorer/fs/types';

import { isFsAncestor } from '@/features/explorer/fs/path';
import { useFileSystem } from '@/features/explorer/fs/use-file-system';
import { useExplorerActions } from '@/features/explorer/hooks/use-explorer-actions';

export const EXPLORER_DND_MIME = 'application/x-launchos-fs-path';

export type ExplorerDropPosition = 'into' | null;

export function useExplorerTreeDnD() {
  const fs = useFileSystem();
  const actions = useExplorerActions();
  const [dropTarget, setDropTarget] = useState<FsPath | null>(null);

  const clearDrop = useCallback(() => {
    setDropTarget(null);
  }, []);

  const canDropOnto = useCallback(
    (from: FsPath, targetFolder: FsPath): boolean => {
      if (!from || !targetFolder) {
        return false;
      }
      if (from === targetFolder) {
        return false;
      }
      // Cannot move a folder into itself or a descendant.
      if (isFsAncestor(from, targetFolder)) {
        return false;
      }
      const target = fs.getNode(targetFolder);
      return target?.kind === 'folder';
    },
    [fs],
  );

  const onDragStart = useCallback((event: DragEvent<HTMLElement>, path: FsPath) => {
    if (path === '/') {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData(EXPLORER_DND_MIME, path);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = useCallback(
    (event: DragEvent<HTMLElement>, targetPath: FsPath, isFolder: boolean) => {
      if (!isFolder) {
        return;
      }
      if (![...event.dataTransfer.types].includes(EXPLORER_DND_MIME)) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setDropTarget(targetPath);
    },
    [],
  );

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>, targetPath: FsPath) => {
    const related = event.relatedTarget as Node | null;
    if (related && event.currentTarget.contains(related)) {
      return;
    }
    setDropTarget((current) => (current === targetPath ? null : current));
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>, targetFolder: FsPath) => {
      event.preventDefault();
      event.stopPropagation();
      const from = event.dataTransfer.getData(EXPLORER_DND_MIME) as FsPath;
      clearDrop();
      if (!from || !canDropOnto(from, targetFolder)) {
        return;
      }
      actions.safeRun(() => actions.move(from, targetFolder));
    },
    [actions, canDropOnto, clearDrop],
  );

  return {
    dropTarget,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    clearDrop,
  };
}
