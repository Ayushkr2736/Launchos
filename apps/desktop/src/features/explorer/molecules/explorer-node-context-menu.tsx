import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@launchos/ui';
import { type ReactNode } from 'react';

import type { FsNode } from '@/features/explorer/fs/types';

interface ExplorerNodeContextMenuProps {
  node: FsNode;
  children: ReactNode;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onCopyPath: () => void;
  onCopyRelativePath: () => void;
  onRevealInOs: () => void;
  onCollapseAll?: (() => void) | undefined;
}

export function ExplorerNodeContextMenu({
  node,
  children,
  onOpen,
  onRename,
  onDelete,
  onNewFile,
  onNewFolder,
  onCopyPath,
  onCopyRelativePath,
  onRevealInOs,
  onCollapseAll,
}: ExplorerNodeContextMenuProps) {
  const isRoot = node.path === '/';
  const isFolder = node.kind === 'folder';
  const revealLabel =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
      ? 'Reveal in Finder'
      : 'Reveal in File Manager';

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-48">
        {node.kind === 'file' ? (
          <ContextMenuItem onSelect={onOpen}>
            Open
            <ContextMenuShortcut>↵</ContextMenuShortcut>
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onSelect={onOpen}>Expand / Collapse</ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={onNewFile}>New File</ContextMenuItem>
        <ContextMenuItem onSelect={onNewFolder}>New Folder</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={isRoot} onSelect={onRename}>
          Rename
          <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          disabled={isRoot}
          onSelect={onDelete}
          className="text-destructive focus:text-destructive"
        >
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={onCopyPath}>Copy Path</ContextMenuItem>
        <ContextMenuItem onSelect={onCopyRelativePath}>Copy Relative Path</ContextMenuItem>
        <ContextMenuItem onSelect={onRevealInOs}>{revealLabel}</ContextMenuItem>
        {isFolder && onCollapseAll ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={onCollapseAll}>Collapse Folders in Explorer</ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}
