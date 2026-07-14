import { cn } from '@launchos/ui';
import { motion } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';

import type { ExplorerVisibleNode } from '@/features/explorer/hooks/use-explorer-visible-nodes';

import { ExplorerInlineInput } from '@/features/explorer/atoms/explorer-inline-input';
import { getFileIcon, getFileIconClass } from '@/features/explorer/atoms/file-icon';
import { isValidFsName } from '@/features/explorer/fs/path';
import { useFileSystem } from '@/features/explorer/fs/use-file-system';
import { useExplorerActions } from '@/features/explorer/hooks/use-explorer-actions';
import { type useExplorerTreeDnD } from '@/features/explorer/hooks/use-explorer-tree-dnd';
import { ExplorerNodeContextMenu } from '@/features/explorer/molecules/explorer-node-context-menu';
import { explorerDepthClass } from '@/features/explorer/utils/depth-class';
import { useExplorerStore } from '@/stores/explorer-store';

interface ExplorerTreeNodeProps {
  entry: ExplorerVisibleNode;
  dnd: ReturnType<typeof useExplorerTreeDnD>;
}

function HighlightedName({ name, query }: { name: string; query: string | null }) {
  if (!query) {
    return <span className="min-w-0 flex-1 truncate">{name}</span>;
  }
  const lower = name.toLowerCase();
  const index = lower.indexOf(query);
  if (index < 0) {
    return <span className="min-w-0 flex-1 truncate">{name}</span>;
  }
  const before = name.slice(0, index);
  const match = name.slice(index, index + query.length);
  const after = name.slice(index + query.length);
  return (
    <span className="min-w-0 flex-1 truncate">
      {before}
      <mark className="bg-primary/25 text-foreground rounded-sm px-0.5">{match}</mark>
      {after}
    </span>
  );
}

export function ExplorerTreeNode({ entry, dnd }: ExplorerTreeNodeProps) {
  const { node, depth, expanded, matchQuery } = entry;
  const selectedPath = useExplorerStore((state) => state.selectedPath);
  const renamingPath = useExplorerStore((state) => state.renamingPath);
  const toggleExpanded = useExplorerStore((state) => state.toggleExpanded);
  const selectPath = useExplorerStore((state) => state.selectPath);
  const setRenamingPath = useExplorerStore((state) => state.setRenamingPath);
  const loadingPaths = useExplorerStore((state) => state.loadingPaths);
  const actions = useExplorerActions();
  const fs = useFileSystem();
  const [renameError, setRenameError] = useState<string | null>(null);

  const selected = selectedPath === node.path;
  const renaming = renamingPath === node.path;
  const Icon = getFileIcon(node, expanded);
  const isFolder = node.kind === 'folder';
  const dropActive = dnd.dropTarget === node.path;
  const folderLoading =
    isFolder &&
    expanded &&
    (loadingPaths.includes(node.path) ||
      fs.isLoading(node.path) ||
      (node.kind === 'folder' && node.childrenLoaded === false));

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isFolder) {
        toggleExpanded(node.path);
      } else {
        actions.openFile(node);
      }
      return;
    }
    if (event.key === 'F2' && node.path !== '/') {
      event.preventDefault();
      actions.startRename(node.path);
    }
  };

  if (renaming) {
    return (
      <ExplorerInlineInput
        initialValue={node.name}
        depth={depth}
        errorMessage={renameError}
        ariaLabel={`Rename ${node.name}`}
        onCancel={() => {
          setRenameError(null);
          setRenamingPath(null);
        }}
        onSubmit={(value) => {
          const next = value.trim();
          if (!next || next === node.name) {
            setRenamingPath(null);
            return true;
          }
          if (!isValidFsName(next)) {
            setRenameError('Invalid name');
            return false;
          }
          setRenameError(null);
          actions.safeRun(() => actions.rename(node.path, next));
          return true;
        }}
      />
    );
  }

  return (
    <ExplorerNodeContextMenu
      node={node}
      onOpen={() => {
        if (isFolder) {
          toggleExpanded(node.path);
          selectPath(node.path);
        } else {
          actions.openFile(node);
        }
      }}
      onRename={() => {
        actions.startRename(node.path);
      }}
      onDelete={() => {
        actions.safeRun(() => actions.remove(node.path));
      }}
      onNewFile={() => {
        actions.startCreate(isFolder ? node.path : (node.parentPath ?? '/'), 'file');
      }}
      onNewFolder={() => {
        actions.startCreate(isFolder ? node.path : (node.parentPath ?? '/'), 'folder');
      }}
      onCopyPath={() => {
        actions.safeRun(() => actions.copyPath(node.path, false));
      }}
      onCopyRelativePath={() => {
        actions.safeRun(() => actions.copyPath(node.path, true));
      }}
      onRevealInOs={() => {
        actions.safeRun(() => actions.revealInOs(node.path));
      }}
      onCollapseAll={
        isFolder
          ? () => {
              actions.collapseAll();
            }
          : undefined
      }
    >
      <motion.div
        layout="position"
        initial={{ opacity: 0.55, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        onDragOver={(event) => {
          dnd.onDragOver(event, node.path, isFolder);
        }}
        onDragLeave={(event) => {
          dnd.onDragLeave(event, node.path);
        }}
        onDrop={(event) => {
          if (isFolder) {
            dnd.onDrop(event, node.path);
          }
        }}
        className={cn(
          'explorer-tree-row relative rounded-sm transition-colors duration-150',
          dropActive && 'bg-primary/15 ring-primary/40 ring-1 ring-inset',
        )}
      >
        <div
          role="treeitem"
          aria-level={depth + 1}
          aria-expanded={isFolder ? expanded : undefined}
          aria-selected={selected}
          id={`explorer-node-${node.path}`}
          tabIndex={selected ? 0 : -1}
          draggable={node.path !== '/'}
          onDragStart={(event) => {
            dnd.onDragStart(event, node.path);
          }}
          onClick={() => {
            selectPath(node.path);
          }}
          onDoubleClick={() => {
            if (isFolder) {
              toggleExpanded(node.path);
              return;
            }
            actions.openFile(node);
          }}
          onKeyDown={onKeyDown}
          className={cn(
            'group flex w-full items-center gap-0.5 rounded-sm py-0.5 pr-2 text-left text-sm outline-none',
            explorerDepthClass(depth),
            'hover:bg-accent/70 focus-visible:ring-ring focus-visible:ring-2',
            selected && 'bg-accent text-accent-foreground',
          )}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label={isFolder ? (expanded ? 'Collapse' : 'Expand') : undefined}
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm',
              isFolder && 'hover:bg-accent/80',
            )}
            onClick={(event) => {
              event.stopPropagation();
              if (!isFolder) {
                return;
              }
              selectPath(node.path);
              toggleExpanded(node.path);
            }}
          >
            {isFolder ? (
              folderLoading ? (
                <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <ChevronRight
                  className={cn(
                    'text-muted-foreground h-3.5 w-3.5 transition-transform duration-150 ease-out',
                    expanded && 'rotate-90',
                  )}
                  aria-hidden
                />
              )
            ) : (
              <span className="h-3.5 w-3.5" />
            )}
          </button>
          <Icon className={cn('h-4 w-4 shrink-0', getFileIconClass(node, selected))} aria-hidden />
          <HighlightedName name={node.name} query={matchQuery} />
        </div>
      </motion.div>
    </ExplorerNodeContextMenu>
  );
}
