import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ScrollArea,
  cn,
} from '@launchos/ui';
import { useEffect, useMemo } from 'react';

import { getFsParentPath } from '@/features/explorer/fs/path';
import { useFileSystem } from '@/features/explorer/fs/use-file-system';
import { useExplorerActions } from '@/features/explorer/hooks/use-explorer-actions';
import { useExplorerTreeDnD } from '@/features/explorer/hooks/use-explorer-tree-dnd';
import { useExplorerTreeKeyboard } from '@/features/explorer/hooks/use-explorer-tree-keyboard';
import {
  useExplorerVisibleNodes,
  type ExplorerVisibleNode,
} from '@/features/explorer/hooks/use-explorer-visible-nodes';
import { ExplorerCreateRow } from '@/features/explorer/molecules/explorer-create-row';
import { ExplorerTreeNode } from '@/features/explorer/molecules/explorer-tree-node';
import { useExplorerStore } from '@/stores/explorer-store';

export function ExplorerTree() {
  const fs = useFileSystem();
  const entries = useExplorerVisibleNodes();
  const nodes = useMemo(
    () => entries.filter((entry): entry is ExplorerVisibleNode => entry.kind === 'node'),
    [entries],
  );
  const selectedPath = useExplorerStore((state) => state.selectedPath);
  const selectPath = useExplorerStore((state) => state.selectPath);
  const searchQuery = useExplorerStore((state) => state.searchQuery);
  const clearSearch = useExplorerStore((state) => state.clearSearch);
  const lastError = useExplorerStore((state) => state.lastError);
  const clearError = useExplorerStore((state) => state.clearError);
  const actions = useExplorerActions();
  const dnd = useExplorerTreeDnD();
  const { onKeyDown } = useExplorerTreeKeyboard(nodes);

  useEffect(() => {
    if (!selectedPath && nodes[0]) {
      selectPath(nodes[0].node.path);
    }
  }, [nodes, selectPath, selectedPath]);

  useEffect(() => {
    if (!selectedPath) {
      return;
    }
    document.getElementById(`explorer-node-${selectedPath}`)?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [selectedPath]);

  const createParent =
    selectedPath && fs.getNode(selectedPath)?.kind === 'folder'
      ? selectedPath
      : (selectedPath && getFsParentPath(selectedPath)) || fs.getRootPath();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {lastError ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive flex items-start justify-between gap-2 border-b px-2 py-1.5 text-xs"
        >
          <p className="min-w-0 flex-1 leading-snug">{lastError}</p>
          <button
            type="button"
            className="shrink-0 underline-offset-2 hover:underline"
            onClick={() => {
              clearError();
            }}
          >
            Dismiss
          </button>
        </div>
      ) : null}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <ScrollArea className="min-h-0 flex-1">
            <div
              role="tree"
              aria-label="Project files"
              aria-multiselectable={false}
              tabIndex={0}
              className={cn(
                'explorer-tree min-h-full p-1 outline-none',
                '[&_.explorer-tree-row]:will-change-transform',
              )}
              onKeyDown={onKeyDown}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  dnd.clearDrop();
                }
              }}
            >
              {entries.length === 0 ? (
                <p className="text-muted-foreground px-3 py-8 text-center text-xs">
                  {searchQuery.trim() ? 'No files match your search.' : 'Project is empty.'}
                </p>
              ) : (
                entries.map((entry) => {
                  if (entry.kind === 'create') {
                    return (
                      <ExplorerCreateRow
                        key={`create:${entry.parentPath}:${entry.createKind}`}
                        parentPath={entry.parentPath}
                        createKind={entry.createKind}
                        depth={entry.depth}
                      />
                    );
                  }
                  return <ExplorerTreeNode key={entry.node.path} entry={entry} dnd={dnd} />;
                })
              )}
            </div>
          </ScrollArea>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onSelect={() => {
              actions.startCreate(createParent, 'file');
            }}
          >
            New File
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() => {
              actions.startCreate(createParent, 'folder');
            }}
          >
            New Folder
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onSelect={() => {
              actions.collapseAll();
            }}
          >
            Collapse Folders in Explorer
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!searchQuery.trim()}
            onSelect={() => {
              clearSearch();
            }}
          >
            Clear search
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
