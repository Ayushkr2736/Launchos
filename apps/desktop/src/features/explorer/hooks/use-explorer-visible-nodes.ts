import { useMemo } from 'react';

import type { FsNode, FsPath } from '@/features/explorer/fs/types';

import { FS_ROOT_PATH } from '@/features/explorer/fs/path';
import { useFileSystem } from '@/features/explorer/fs/use-file-system';
import { useExplorerStore } from '@/stores/explorer-store';

export interface ExplorerVisibleNode {
  readonly kind: 'node';
  readonly node: FsNode;
  readonly depth: number;
  readonly expanded: boolean;
  /** Lowercase query when this name matched the filter. */
  readonly matchQuery: string | null;
}

export interface ExplorerVisibleCreate {
  readonly kind: 'create';
  readonly parentPath: FsPath;
  readonly createKind: 'file' | 'folder';
  readonly depth: number;
}

export type ExplorerVisibleEntry = ExplorerVisibleNode | ExplorerVisibleCreate;

function matchesQuery(node: FsNode, query: string): boolean {
  return node.name.toLowerCase().includes(query);
}

function createDepth(parentPath: FsPath): number {
  if (parentPath === FS_ROOT_PATH) {
    return 1;
  }
  return parentPath.split('/').filter(Boolean).length + 1;
}

function collectMatches(
  fs: ReturnType<typeof useFileSystem>,
  path: FsPath,
  query: string,
  depth: number,
  out: ExplorerVisibleEntry[],
  creating: { parentPath: FsPath; kind: 'file' | 'folder' } | null,
): boolean {
  const node = fs.getNode(path);
  if (!node) {
    return false;
  }

  if (node.kind === 'file') {
    if (matchesQuery(node, query)) {
      out.push({ kind: 'node', node, depth, expanded: false, matchQuery: query });
      return true;
    }
    return false;
  }

  const childHits: ExplorerVisibleEntry[] = [];
  let childMatched = false;
  for (const child of fs.listChildren(path)) {
    const before = childHits.length;
    const hit = collectMatches(fs, child.path, query, depth + 1, childHits, creating);
    if (hit || childHits.length > before) {
      childMatched = true;
    }
  }

  const selfMatch = matchesQuery(node, query);
  if (selfMatch || childMatched) {
    out.push({
      kind: 'node',
      node,
      depth,
      expanded: true,
      matchQuery: selfMatch ? query : null,
    });
    if (creating?.parentPath === path) {
      out.push({
        kind: 'create',
        parentPath: path,
        createKind: creating.kind,
        depth: depth + 1,
      });
    }
    out.push(...childHits);
    return true;
  }

  return false;
}

function collectExpanded(
  fs: ReturnType<typeof useFileSystem>,
  path: FsPath,
  depth: number,
  expandedPaths: ReadonlySet<FsPath>,
  out: ExplorerVisibleEntry[],
  creating: { parentPath: FsPath; kind: 'file' | 'folder' } | null,
): void {
  const node = fs.getNode(path);
  if (!node) {
    return;
  }

  const expanded = node.kind === 'folder' && expandedPaths.has(node.path);
  out.push({ kind: 'node', node, depth, expanded, matchQuery: null });

  if (node.kind === 'folder' && expanded) {
    if (creating?.parentPath === path) {
      out.push({
        kind: 'create',
        parentPath: path,
        createKind: creating.kind,
        depth: depth + 1,
      });
    }
    for (const child of fs.listChildren(path)) {
      collectExpanded(fs, child.path, depth + 1, expandedPaths, out, creating);
    }
  }
}

export function useExplorerVisibleNodes(): ExplorerVisibleEntry[] {
  const fs = useFileSystem();
  const expandedPaths = useExplorerStore((state) => state.expandedPaths);
  const searchQuery = useExplorerStore((state) => state.searchQuery);
  const creating = useExplorerStore((state) => state.creating);

  return useMemo(() => {
    const expandedSet = new Set(expandedPaths);
    const query = searchQuery.trim().toLowerCase();
    const out: ExplorerVisibleEntry[] = [];

    if (query) {
      collectMatches(fs, FS_ROOT_PATH, query, 0, out, creating);
      // Creating under a folder that didn't match — still show the create row.
      if (creating && !out.some((entry) => entry.kind === 'create')) {
        out.push({
          kind: 'create',
          parentPath: creating.parentPath,
          createKind: creating.kind,
          depth: createDepth(creating.parentPath),
        });
      }
      return out;
    }

    collectExpanded(fs, FS_ROOT_PATH, 0, expandedSet, out, creating);
    return out;
  }, [creating, expandedPaths, fs, searchQuery]);
}

/** Flat list of navigable tree nodes (excludes the inline create row). */
export function useExplorerNavigableNodes(): ExplorerVisibleNode[] {
  const entries = useExplorerVisibleNodes();
  return useMemo(
    () => entries.filter((entry): entry is ExplorerVisibleNode => entry.kind === 'node'),
    [entries],
  );
}
