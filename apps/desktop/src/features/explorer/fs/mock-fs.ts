import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  FS_ROOT_PATH,
  getFsName,
  getFsParentPath,
  isFsAncestor,
  isValidFsName,
  joinFsPath,
  normalizeFsPath,
  sortFsNames,
} from '@/features/explorer/fs/path';
import { createDefaultMockTree } from '@/features/explorer/fs/seed';
import {
  FileSystemError,
  type FileSystemProvider,
  type FsNode,
  type FsPath,
  type IndexTreeProgress,
} from '@/features/explorer/fs/types';

const MOCK_FS_STORAGE_KEY = 'launchos.explorer.mock-fs';

interface MockFsStoreState {
  nodes: Record<FsPath, FsNode>;
  revision: number;
  setNodes: (nodes: Record<FsPath, FsNode>) => void;
  bump: () => void;
  reset: () => void;
}

const useMockFsStore = create<MockFsStoreState>()(
  persist(
    (set, get) => ({
      nodes: createDefaultMockTree(),
      revision: 0,
      setNodes: (nodes) => {
        set({ nodes, revision: get().revision + 1 });
      },
      bump: () => {
        set({ revision: get().revision + 1 });
      },
      reset: () => {
        set({ nodes: createDefaultMockTree(), revision: get().revision + 1 });
      },
    }),
    {
      name: MOCK_FS_STORAGE_KEY,
      partialize: (state) => ({ nodes: state.nodes }),
    },
  ),
);

function cloneNodes(nodes: Record<FsPath, FsNode>): Record<FsPath, FsNode> {
  const next: Record<FsPath, FsNode> = {};
  for (const [path, node] of Object.entries(nodes)) {
    if (node.kind === 'folder') {
      next[path] = { ...node, children: [...node.children] };
    } else {
      next[path] = { ...node };
    }
  }
  return next;
}

function assertFolder(
  node: FsNode | undefined,
  path: FsPath,
): asserts node is Extract<FsNode, { kind: 'folder' }> {
  if (!node) {
    throw new FileSystemError('NOT_FOUND', `Path not found: ${path}`);
  }
  if (node.kind !== 'folder') {
    throw new FileSystemError('NOT_A_FOLDER', `Not a folder: ${path}`);
  }
}

function rewriteSubtree(
  nodes: Record<FsPath, FsNode>,
  fromPath: FsPath,
  toPath: FsPath,
): Record<FsPath, FsNode> {
  const next = cloneNodes(nodes);
  const moving: FsNode[] = Object.values(next).filter((node) => isFsAncestor(fromPath, node.path));

  for (const node of moving) {
    delete next[node.path];
  }

  for (const node of moving) {
    const relative = node.path === fromPath ? '' : node.path.slice(fromPath.length);
    const newPath = normalizeFsPath(`${toPath}${relative}`);
    if (node.kind === 'folder') {
      next[newPath] = {
        ...node,
        path: newPath,
        name: getFsName(newPath),
        parentPath: getFsParentPath(newPath),
        children: node.children.map((child) => {
          const childRelative = child === fromPath ? '' : child.slice(fromPath.length);
          return normalizeFsPath(`${toPath}${childRelative}`);
        }),
        updatedAt: Date.now(),
      };
    } else {
      next[newPath] = {
        ...node,
        path: newPath,
        name: getFsName(newPath),
        parentPath: getFsParentPath(newPath),
        updatedAt: Date.now(),
      };
    }
  }

  return next;
}

function sortChildren(nodes: Record<FsPath, FsNode>, parentPath: FsPath): void {
  const parent = nodes[parentPath];
  if (!parent || parent.kind !== 'folder') {
    return;
  }
  const sorted = [...parent.children].sort((a, b) => {
    const left = nodes[a];
    const right = nodes[b];
    return sortFsNames(
      left?.name ?? a,
      right?.name ?? b,
      left?.kind === 'folder',
      right?.kind === 'folder',
    );
  });
  nodes[parentPath] = { ...parent, children: sorted, updatedAt: Date.now() };
}

class MockFileSystem implements FileSystemProvider {
  readonly id = 'mock';

  getRootPath(): FsPath {
    return FS_ROOT_PATH;
  }

  getRootLabel(): string {
    return 'launchos';
  }

  getNode(path: FsPath): FsNode | null {
    return useMockFsStore.getState().nodes[normalizeFsPath(path)] ?? null;
  }

  listChildren(path: FsPath): FsNode[] {
    const normalized = normalizeFsPath(path);
    const node = useMockFsStore.getState().nodes[normalized];
    assertFolder(node, normalized);
    return node.children
      .map((child) => useMockFsStore.getState().nodes[child])
      .filter((child): child is FsNode => Boolean(child));
  }

  async loadFolder(_path: FsPath): Promise<void> {
    // Mock tree is fully materialized in memory.
  }

  isLoading(_path?: FsPath): boolean {
    return false;
  }

  async indexTree(
    _path?: FsPath,
    _depth?: number,
    _onProgress?: (progress: IndexTreeProgress) => void,
  ): Promise<void> {
    // Mock tree is fully materialized in memory.
  }

  resolveNativePath(path: FsPath): string | null {
    return normalizeFsPath(path);
  }

  async readFileContent(path: FsPath): Promise<string> {
    const normalized = normalizeFsPath(path);
    const node = useMockFsStore.getState().nodes[normalized];
    if (!node) {
      throw new FileSystemError('NOT_FOUND', `Path not found: ${normalized}`);
    }
    if (node.kind !== 'file') {
      throw new FileSystemError('INVALID_TARGET', `Path is a folder: ${normalized}`);
    }
    return node.content;
  }

  async writeFileContent(path: FsPath, content: string): Promise<void> {
    const normalized = normalizeFsPath(path);
    const nodes = cloneNodes(useMockFsStore.getState().nodes);
    const node = nodes[normalized];
    if (!node) {
      throw new FileSystemError('NOT_FOUND', `Path not found: ${normalized}`);
    }
    if (node.kind !== 'file') {
      throw new FileSystemError('INVALID_TARGET', `Path is a folder: ${normalized}`);
    }
    nodes[normalized] = { ...node, content, updatedAt: Date.now() };
    useMockFsStore.getState().setNodes(nodes);
  }

  async createFile(parentPath: FsPath, name: string, content = ''): Promise<FsNode> {
    if (!isValidFsName(name)) {
      throw new FileSystemError('INVALID_NAME', `Invalid file name: ${name}`);
    }
    const parent = normalizeFsPath(parentPath);
    const nodes = cloneNodes(useMockFsStore.getState().nodes);
    assertFolder(nodes[parent], parent);
    const path = joinFsPath(parent, name);
    if (nodes[path]) {
      throw new FileSystemError('ALREADY_EXISTS', `Already exists: ${path}`);
    }
    const stamp = Date.now();
    const created: FsNode = {
      path,
      name,
      kind: 'file',
      parentPath: parent,
      content,
      createdAt: stamp,
      updatedAt: stamp,
    };
    nodes[path] = created;
    const folderNode = nodes[parent];
    assertFolder(folderNode, parent);
    nodes[parent] = {
      ...folderNode,
      children: [...folderNode.children, path],
      updatedAt: stamp,
    };
    sortChildren(nodes, parent);
    useMockFsStore.getState().setNodes(nodes);
    return created;
  }

  async createFolder(parentPath: FsPath, name: string): Promise<FsNode> {
    if (!isValidFsName(name)) {
      throw new FileSystemError('INVALID_NAME', `Invalid folder name: ${name}`);
    }
    const parent = normalizeFsPath(parentPath);
    const nodes = cloneNodes(useMockFsStore.getState().nodes);
    assertFolder(nodes[parent], parent);
    const path = joinFsPath(parent, name);
    if (nodes[path]) {
      throw new FileSystemError('ALREADY_EXISTS', `Already exists: ${path}`);
    }
    const stamp = Date.now();
    const created: FsNode = {
      path,
      name,
      kind: 'folder',
      parentPath: parent,
      children: [],
      childrenLoaded: true,
      createdAt: stamp,
      updatedAt: stamp,
    };
    nodes[path] = created;
    const folderNode = nodes[parent];
    assertFolder(folderNode, parent);
    nodes[parent] = {
      ...folderNode,
      children: [...folderNode.children, path],
      updatedAt: stamp,
    };
    sortChildren(nodes, parent);
    useMockFsStore.getState().setNodes(nodes);
    return created;
  }

  async rename(path: FsPath, nextName: string): Promise<FsNode> {
    if (!isValidFsName(nextName)) {
      throw new FileSystemError('INVALID_NAME', `Invalid name: ${nextName}`);
    }
    const from = normalizeFsPath(path);
    if (from === FS_ROOT_PATH) {
      throw new FileSystemError('INVALID_NAME', 'Cannot rename project root');
    }
    const nodes = cloneNodes(useMockFsStore.getState().nodes);
    const node = nodes[from];
    if (!node) {
      throw new FileSystemError('NOT_FOUND', `Path not found: ${from}`);
    }
    const parent = node.parentPath ?? FS_ROOT_PATH;
    const to = joinFsPath(parent, nextName);
    if (to !== from && nodes[to]) {
      throw new FileSystemError('ALREADY_EXISTS', `Already exists: ${to}`);
    }
    if (to === from) {
      return node;
    }

    const rewritten = rewriteSubtree(nodes, from, to);
    const parentNode = rewritten[parent];
    assertFolder(parentNode, parent);
    rewritten[parent] = {
      ...parentNode,
      children: parentNode.children.map((child) => (child === from ? to : child)),
      updatedAt: Date.now(),
    };
    sortChildren(rewritten, parent);
    useMockFsStore.getState().setNodes(rewritten);
    const result = rewritten[to];
    if (!result) {
      throw new FileSystemError('NOT_FOUND', `Rename failed: ${to}`);
    }
    return result;
  }

  async delete(path: FsPath): Promise<void> {
    const target = normalizeFsPath(path);
    if (target === FS_ROOT_PATH) {
      throw new FileSystemError('INVALID_TARGET', 'Cannot delete project root');
    }
    const nodes = cloneNodes(useMockFsStore.getState().nodes);
    const node = nodes[target];
    if (!node) {
      throw new FileSystemError('NOT_FOUND', `Path not found: ${target}`);
    }
    for (const entry of Object.values(nodes)) {
      if (isFsAncestor(target, entry.path)) {
        delete nodes[entry.path];
      }
    }
    const parent = node.parentPath ?? FS_ROOT_PATH;
    const parentNode = nodes[parent];
    if (parentNode?.kind === 'folder') {
      nodes[parent] = {
        ...parentNode,
        children: parentNode.children.filter((child) => child !== target),
        updatedAt: Date.now(),
      };
    }
    useMockFsStore.getState().setNodes(nodes);
  }

  async move(path: FsPath, targetFolderPath: FsPath): Promise<FsNode> {
    const from = normalizeFsPath(path);
    const targetFolder = normalizeFsPath(targetFolderPath);
    if (from === FS_ROOT_PATH) {
      throw new FileSystemError('INVALID_TARGET', 'Cannot move project root');
    }
    if (isFsAncestor(from, targetFolder)) {
      throw new FileSystemError('INVALID_TARGET', 'Cannot move a folder into itself');
    }

    const nodes = cloneNodes(useMockFsStore.getState().nodes);
    const node = nodes[from];
    if (!node) {
      throw new FileSystemError('NOT_FOUND', `Path not found: ${from}`);
    }
    assertFolder(nodes[targetFolder], targetFolder);

    const to = joinFsPath(targetFolder, node.name);
    if (nodes[to] && to !== from) {
      throw new FileSystemError('ALREADY_EXISTS', `Already exists: ${to}`);
    }
    if (to === from) {
      return node;
    }

    const previousParent = node.parentPath ?? FS_ROOT_PATH;
    const rewritten = rewriteSubtree(nodes, from, to);

    const oldParent = rewritten[previousParent];
    if (oldParent?.kind === 'folder') {
      rewritten[previousParent] = {
        ...oldParent,
        children: oldParent.children.filter((child) => child !== from),
        updatedAt: Date.now(),
      };
    }

    const newParent = rewritten[targetFolder];
    assertFolder(newParent, targetFolder);
    rewritten[targetFolder] = {
      ...newParent,
      children: [...newParent.children.filter((child) => child !== to), to],
      updatedAt: Date.now(),
    };
    sortChildren(rewritten, targetFolder);
    if (previousParent !== targetFolder) {
      sortChildren(rewritten, previousParent);
    }

    useMockFsStore.getState().setNodes(rewritten);
    const result = rewritten[to];
    if (!result) {
      throw new FileSystemError('NOT_FOUND', `Move failed: ${to}`);
    }
    return result;
  }

  exists(path: FsPath): boolean {
    return Boolean(useMockFsStore.getState().nodes[normalizeFsPath(path)]);
  }

  subscribe(listener: () => void): () => void {
    return useMockFsStore.subscribe(listener);
  }

  reset(): void {
    useMockFsStore.getState().reset();
  }
}

/** Shared mock filesystem instance used by the Explorer until a real adapter ships. */
export const mockFileSystem: FileSystemProvider = new MockFileSystem();

/** Subscribe helper for React: returns mock FS revision for re-renders. */
export function useMockFsRevision(): number {
  return useMockFsStore((state) => state.revision);
}

export { useMockFsStore };
