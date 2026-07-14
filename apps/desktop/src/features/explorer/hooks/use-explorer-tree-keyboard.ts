import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react';

import type { FsPath } from '@/features/explorer/fs/types';
import type { ExplorerVisibleNode } from '@/features/explorer/hooks/use-explorer-visible-nodes';

import { getFsParentPath } from '@/features/explorer/fs/path';
import { useFileSystem } from '@/features/explorer/fs/use-file-system';
import { useExplorerActions } from '@/features/explorer/hooks/use-explorer-actions';
import { useExplorerStore } from '@/stores/explorer-store';

const TYPEAHEAD_RESET_MS = 700;

function focusNode(path: FsPath): void {
  requestAnimationFrame(() => {
    document.getElementById(`explorer-node-${path}`)?.focus();
    document.getElementById(`explorer-node-${path}`)?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  });
}

export function useExplorerTreeKeyboard(nodes: readonly ExplorerVisibleNode[]) {
  const fs = useFileSystem();
  const selectedPath = useExplorerStore((state) => state.selectedPath);
  const selectPath = useExplorerStore((state) => state.selectPath);
  const toggleExpanded = useExplorerStore((state) => state.toggleExpanded);
  const expandPath = useExplorerStore((state) => state.expandPath);
  const collapsePath = useExplorerStore((state) => state.collapsePath);
  const actions = useExplorerActions();
  const typeaheadRef = useRef('');
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (typeaheadTimer.current) {
        clearTimeout(typeaheadTimer.current);
      }
    };
  }, []);

  const selectIndex = useCallback(
    (index: number) => {
      if (nodes.length === 0) {
        return;
      }
      const clamped = Math.max(0, Math.min(index, nodes.length - 1));
      const next = nodes[clamped];
      if (!next) {
        return;
      }
      selectPath(next.node.path);
      focusNode(next.node.path);
    },
    [nodes, selectPath],
  );

  const moveSelection = useCallback(
    (delta: number) => {
      if (nodes.length === 0) {
        return;
      }
      const index = nodes.findIndex((entry) => entry.node.path === selectedPath);
      const nextIndex = index < 0 ? 0 : Math.max(0, Math.min(index + delta, nodes.length - 1));
      selectIndex(nextIndex);
    },
    [nodes, selectIndex, selectedPath],
  );

  const typeahead = useCallback(
    (char: string) => {
      typeaheadRef.current += char.toLowerCase();
      if (typeaheadTimer.current) {
        clearTimeout(typeaheadTimer.current);
      }
      typeaheadTimer.current = setTimeout(() => {
        typeaheadRef.current = '';
      }, TYPEAHEAD_RESET_MS);

      const query = typeaheadRef.current;
      const index = nodes.findIndex((entry) => entry.node.path === selectedPath);
      const from = index < 0 ? 0 : index + 1;
      const ordered = [...nodes.slice(from), ...nodes.slice(0, from)];
      const match = ordered.find((entry) => entry.node.name.toLowerCase().startsWith(query));
      if (match) {
        selectPath(match.node.path);
        focusNode(match.node.path);
      }
    },
    [nodes, selectPath, selectedPath],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveSelection(1);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveSelection(-1);
        return;
      }
      if (event.key === 'Home') {
        event.preventDefault();
        selectIndex(0);
        return;
      }
      if (event.key === 'End') {
        event.preventDefault();
        selectIndex(nodes.length - 1);
        return;
      }
      if (event.key === 'PageDown') {
        event.preventDefault();
        moveSelection(10);
        return;
      }
      if (event.key === 'PageUp') {
        event.preventDefault();
        moveSelection(-10);
        return;
      }

      const selected = selectedPath ? fs.getNode(selectedPath) : null;
      if (!selected) {
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          typeahead(event.key);
        }
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (selected.kind === 'folder') {
          const expanded = useExplorerStore.getState().expandedPaths.includes(selected.path);
          if (!expanded) {
            expandPath(selected.path);
          } else {
            const index = nodes.findIndex((entry) => entry.node.path === selected.path);
            const next = nodes[index + 1];
            if (next && next.depth > (nodes[index]?.depth ?? 0)) {
              selectPath(next.node.path);
              focusNode(next.node.path);
            }
          }
        }
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (selected.kind === 'folder') {
          const expanded = useExplorerStore.getState().expandedPaths.includes(selected.path);
          if (expanded) {
            collapsePath(selected.path);
            return;
          }
        }
        const parent = getFsParentPath(selected.path);
        if (parent) {
          selectPath(parent);
          focusNode(parent);
        }
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (selected.kind === 'file') {
          actions.openFile(selected);
        } else {
          toggleExpanded(selected.path);
        }
        return;
      }

      if (event.key === 'F2' && selected.path !== '/') {
        event.preventDefault();
        actions.startRename(selected.path);
        return;
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && selected.path !== '/') {
        if (event.metaKey || event.ctrlKey) {
          return;
        }
        event.preventDefault();
        actions.safeRun(() => actions.remove(selected.path));
        return;
      }

      if (event.key === 'Escape') {
        const query = useExplorerStore.getState().searchQuery;
        if (query.trim()) {
          event.preventDefault();
          useExplorerStore.getState().clearSearch();
        }
        return;
      }

      if (
        event.key.length === 1 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.nativeEvent.isComposing
      ) {
        event.preventDefault();
        typeahead(event.key);
      }
    },
    [
      actions,
      collapsePath,
      expandPath,
      fs,
      moveSelection,
      nodes,
      selectIndex,
      selectPath,
      selectedPath,
      toggleExpanded,
      typeahead,
    ],
  );

  return { onKeyDown, moveSelection, selectIndex, focusNode };
}
