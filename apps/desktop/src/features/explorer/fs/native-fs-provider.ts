import type {
  FileSystemListener,
  FileSystemProvider,
  FsFolderNode,
  FsNode,
  FsPath,
  IndexTreeProgress,
} from '@/features/explorer/fs/types';
import type { FileSystemService, NativeFsPath } from '@/services/filesystem';

import {
  FS_ROOT_PATH,
  getFsParentPath,
  isFsAncestor,
  isValidFsName,
  joinFsPath,
  normalizeFsPath,
  sortFsNames,
} from '@/features/explorer/fs/path';
import { FileSystemError } from '@/features/explorer/fs/types';
import { FileSystemServiceError, getNativeBaseName, joinNativePath } from '@/services/filesystem';

const SEARCH_SKIP = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'target',
  '.turbo',
  'coverage',
  '.cache',
]);

const MAX_INDEX_DEPTH = 10;

function mapServiceError(error: unknown): never {
  if (error instanceof FileSystemError) {
    throw error;
  }
  if (error instanceof FileSystemServiceError) {
    switch (error.code) {
      case 'NOT_FOUND':
        throw new FileSystemError('NOT_FOUND', error.message);
      case 'ALREADY_EXISTS':
        throw new FileSystemError('ALREADY_EXISTS', error.message);
      case 'INVALID_NAME':
        throw new FileSystemError('INVALID_NAME', error.message);
      case 'NOT_A_FOLDER':
        throw new FileSystemError('NOT_A_FOLDER', error.message);
      case 'PERMISSION_DENIED':
        throw new FileSystemError(
          'PERMISSION_DENIED',
          error.message ||
            'Permission denied. Choose a folder under Home, Documents, Desktop, or Downloads.',
        );
      case 'UNSUPPORTED':
        throw new FileSystemError('UNSUPPORTED', error.message);
      case 'INVALID_PATH':
        throw new FileSystemError('INVALID_TARGET', error.message);
      default:
        throw new FileSystemError('IO_ERROR', error.message);
    }
  }
  throw new FileSystemError(
    'IO_ERROR',
    error instanceof Error ? error.message : 'Filesystem operation failed',
  );
}

export interface NativeFileSystemProviderOptions {
  rootPath: NativeFsPath;
  service: FileSystemService;
}

/**
 * Explorer adapter over `FileSystemService`.
 * Keeps a virtual `/` tree cache and maps to the opened native project root.
 */
export class NativeFileSystemProvider implements FileSystemProvider {
  readonly id = 'native-fs';

  private readonly rootNative: NativeFsPath;
  private readonly rootLabel: string;
  private readonly service: FileSystemService;
  private nodes: Record<FsPath, FsNode>;
  private readonly listeners = new Set<FileSystemListener>();
  private readonly loading = new Set<FsPath>();
  private readonly loadingPromises = new Map<FsPath, Promise<void>>();
  private revision = 0;

  constructor(options: NativeFileSystemProviderOptions) {
    this.rootNative = options.rootPath.replace(/[/\\]+$/, '') || options.rootPath;
    this.rootLabel = getNativeBaseName(this.rootNative) || 'Project';
    this.service = options.service;
    const stamp = Date.now();
    this.nodes = {
      [FS_ROOT_PATH]: {
        path: FS_ROOT_PATH,
        name: this.rootLabel,
        kind: 'folder',
        parentPath: null,
        children: [],
        childrenLoaded: false,
        createdAt: stamp,
        updatedAt: stamp,
      },
    };
  }

  getRootPath(): FsPath {
    return FS_ROOT_PATH;
  }

  getRootLabel(): string {
    return this.rootLabel;
  }

  getNode(path: FsPath): FsNode | null {
    return this.nodes[normalizeFsPath(path)] ?? null;
  }

  listChildren(path: FsPath): FsNode[] {
    const normalized = normalizeFsPath(path);
    const node = this.nodes[normalized];
    if (!node || node.kind !== 'folder') {
      return [];
    }
    return node.children
      .map((child) => this.nodes[child])
      .filter((child): child is FsNode => Boolean(child));
  }

  isLoading(path?: FsPath): boolean {
    if (path === undefined) {
      return this.loading.size > 0;
    }
    return this.loading.has(normalizeFsPath(path));
  }

  async loadFolder(path: FsPath): Promise<void> {
    const normalized = normalizeFsPath(path);
    const node = this.nodes[normalized];
    if (!node || node.kind !== 'folder') {
      return;
    }
    const inFlight = this.loadingPromises.get(normalized);
    if (inFlight) {
      return inFlight;
    }

    const task = this.loadFolderInternal(normalized, node).finally(() => {
      this.loadingPromises.delete(normalized);
    });
    this.loadingPromises.set(normalized, task);
    return task;
  }

  private async loadFolderInternal(normalized: FsPath, node: FsFolderNode): Promise<void> {
    this.loading.add(normalized);
    this.notify();
    try {
      const nativePath = this.toNative(normalized);
      const entries = await this.service.readDir(nativePath);
      const stamp = Date.now();
      const childPaths: FsPath[] = [];
      const nextNodes = { ...this.nodes };

      for (const entry of entries) {
        const virtual = joinFsPath(normalized, entry.name);
        childPaths.push(virtual);
        const existing = nextNodes[virtual];
        if (entry.kind === 'folder') {
          const prevChildren = existing?.kind === 'folder' ? existing.children : ([] as FsPath[]);
          const childrenLoaded = existing?.kind === 'folder' ? existing.childrenLoaded : false;
          nextNodes[virtual] = {
            path: virtual,
            name: entry.name,
            kind: 'folder',
            parentPath: normalized === FS_ROOT_PATH ? FS_ROOT_PATH : normalized,
            children: prevChildren,
            ...(childrenLoaded !== undefined ? { childrenLoaded } : { childrenLoaded: false }),
            createdAt: existing?.createdAt ?? stamp,
            updatedAt: stamp,
          };
        } else {
          nextNodes[virtual] = {
            path: virtual,
            name: entry.name,
            kind: 'file',
            parentPath: normalized === FS_ROOT_PATH ? FS_ROOT_PATH : normalized,
            content: existing?.kind === 'file' ? existing.content : '',
            createdAt: existing?.createdAt ?? stamp,
            updatedAt: stamp,
          };
        }
      }

      // Drop stale children that disappeared from disk.
      const previous = node.children;
      for (const child of previous) {
        if (!childPaths.includes(child)) {
          this.deleteSubtreeFrom(nextNodes, child);
        }
      }

      childPaths.sort((a, b) => {
        const left = nextNodes[a];
        const right = nextNodes[b];
        return sortFsNames(
          left?.name ?? a,
          right?.name ?? b,
          left?.kind === 'folder',
          right?.kind === 'folder',
        );
      });

      nextNodes[normalized] = {
        ...node,
        children: childPaths,
        childrenLoaded: true,
        updatedAt: stamp,
      };
      this.nodes = nextNodes;
      this.notify();
    } catch (error) {
      mapServiceError(error);
    } finally {
      this.loading.delete(normalized);
      this.notify();
    }
  }

  async indexTree(
    path: FsPath = FS_ROOT_PATH,
    depth = 0,
    onProgress?: (progress: IndexTreeProgress) => void,
  ): Promise<void> {
    const counters = { scanned: 0, pending: 0 };
    await this.indexTreeInternal(path, depth, onProgress, counters);
  }

  private async indexTreeInternal(
    path: FsPath,
    depth: number,
    onProgress: ((progress: IndexTreeProgress) => void) | undefined,
    counters: { scanned: number; pending: number },
  ): Promise<void> {
    if (depth > MAX_INDEX_DEPTH) {
      return;
    }
    counters.pending += 1;
    onProgress?.({ scannedFolders: counters.scanned, pendingFolders: counters.pending });
    await this.loadFolder(path);
    counters.scanned += 1;
    counters.pending = Math.max(0, counters.pending - 1);
    onProgress?.({ scannedFolders: counters.scanned, pendingFolders: counters.pending });

    const children = this.listChildren(path);
    for (const child of children) {
      if (child.kind !== 'folder') {
        continue;
      }
      if (SEARCH_SKIP.has(child.name)) {
        continue;
      }
      await this.indexTreeInternal(child.path, depth + 1, onProgress, counters);
    }
  }

  resolveNativePath(path: FsPath): string | null {
    try {
      return this.toNative(path);
    } catch {
      return null;
    }
  }

  async readFileContent(path: FsPath): Promise<string> {
    const normalized = normalizeFsPath(path);
    const node = this.getNode(normalized);
    if (node?.kind === 'folder') {
      throw new FileSystemError('INVALID_TARGET', `Path is a folder: ${normalized}`);
    }
    try {
      const content = await this.service.readFile(this.toNative(normalized));
      const stamp = Date.now();
      const existing = this.nodes[normalized];
      this.nodes = {
        ...this.nodes,
        [normalized]: {
          path: normalized,
          name: existing?.name ?? normalized.split('/').pop() ?? normalized,
          kind: 'file',
          parentPath: existing?.parentPath ?? getFsParentPath(normalized),
          content,
          createdAt: existing?.createdAt ?? stamp,
          updatedAt: stamp,
        },
      };
      this.notify();
      return content;
    } catch (error) {
      mapServiceError(error);
    }
  }

  async writeFileContent(path: FsPath, content: string): Promise<void> {
    const normalized = normalizeFsPath(path);
    try {
      await this.service.writeFile(this.toNative(normalized), content);
      const stamp = Date.now();
      const existing = this.nodes[normalized];
      if (existing?.kind === 'file') {
        this.nodes = {
          ...this.nodes,
          [normalized]: { ...existing, content, updatedAt: stamp },
        };
        this.notify();
      }
    } catch (error) {
      mapServiceError(error);
    }
  }

  async createFile(parentPath: FsPath, name: string, content = ''): Promise<FsNode> {
    if (!isValidFsName(name)) {
      throw new FileSystemError('INVALID_NAME', `Invalid file name: ${name}`);
    }
    const parent = normalizeFsPath(parentPath);
    try {
      await this.service.createFile(this.toNative(parent), name, { content });
      await this.loadFolder(parent);
      const created = this.getNode(joinFsPath(parent, name));
      if (!created || created.kind !== 'file') {
        throw new FileSystemError('NOT_FOUND', `Created file missing: ${name}`);
      }
      return created;
    } catch (error) {
      mapServiceError(error);
    }
  }

  async createFolder(parentPath: FsPath, name: string): Promise<FsNode> {
    if (!isValidFsName(name)) {
      throw new FileSystemError('INVALID_NAME', `Invalid folder name: ${name}`);
    }
    const parent = normalizeFsPath(parentPath);
    try {
      await this.service.createFolder(this.toNative(parent), name);
      await this.loadFolder(parent);
      const created = this.getNode(joinFsPath(parent, name));
      if (!created || created.kind !== 'folder') {
        throw new FileSystemError('NOT_FOUND', `Created folder missing: ${name}`);
      }
      return created;
    } catch (error) {
      mapServiceError(error);
    }
  }

  async rename(path: FsPath, nextName: string): Promise<FsNode> {
    if (!isValidFsName(nextName)) {
      throw new FileSystemError('INVALID_NAME', `Invalid name: ${nextName}`);
    }
    const from = normalizeFsPath(path);
    if (from === FS_ROOT_PATH) {
      throw new FileSystemError('INVALID_NAME', 'Cannot rename project root');
    }
    const node = this.getNode(from);
    if (!node) {
      throw new FileSystemError('NOT_FOUND', `Path not found: ${from}`);
    }
    const parent = node.parentPath ?? FS_ROOT_PATH;
    try {
      await this.service.rename(this.toNative(from), nextName);
      await this.loadFolder(parent);
      const renamed = this.getNode(joinFsPath(parent, nextName));
      if (!renamed) {
        throw new FileSystemError('NOT_FOUND', `Renamed path missing: ${nextName}`);
      }
      return renamed;
    } catch (error) {
      mapServiceError(error);
    }
  }

  async delete(path: FsPath): Promise<void> {
    const target = normalizeFsPath(path);
    if (target === FS_ROOT_PATH) {
      throw new FileSystemError('INVALID_TARGET', 'Cannot delete project root');
    }
    const node = this.getNode(target);
    if (!node) {
      throw new FileSystemError('NOT_FOUND', `Path not found: ${target}`);
    }
    const parent = node.parentPath ?? FS_ROOT_PATH;
    try {
      await this.service.delete(this.toNative(target));
      await this.loadFolder(parent);
    } catch (error) {
      mapServiceError(error);
    }
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
    const node = this.getNode(from);
    if (!node) {
      throw new FileSystemError('NOT_FOUND', `Path not found: ${from}`);
    }
    const previousParent = node.parentPath ?? FS_ROOT_PATH;
    try {
      await this.service.move(this.toNative(from), this.toNative(targetFolder));
      await this.loadFolder(previousParent);
      if (previousParent !== targetFolder) {
        await this.loadFolder(targetFolder);
      }
      const moved = this.getNode(joinFsPath(targetFolder, node.name));
      if (!moved) {
        throw new FileSystemError('NOT_FOUND', `Moved path missing: ${node.name}`);
      }
      return moved;
    } catch (error) {
      mapServiceError(error);
    }
  }

  exists(path: FsPath): boolean {
    return Boolean(this.nodes[normalizeFsPath(path)]);
  }

  subscribe(listener: FileSystemListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    const stamp = Date.now();
    this.nodes = {
      [FS_ROOT_PATH]: {
        path: FS_ROOT_PATH,
        name: this.rootLabel,
        kind: 'folder',
        parentPath: null,
        children: [],
        childrenLoaded: false,
        createdAt: stamp,
        updatedAt: stamp,
      },
    };
    this.notify();
  }

  /** Map virtual explorer path → absolute native path. */
  toNative(path: FsPath): NativeFsPath {
    const normalized = normalizeFsPath(path);
    if (normalized === FS_ROOT_PATH) {
      return this.rootNative;
    }
    const relative = normalized.replace(/^\//, '').split('/').filter(Boolean);
    let current = this.rootNative;
    for (const segment of relative) {
      current = joinNativePath(current, segment);
    }
    return current;
  }

  private deleteSubtreeFrom(nodes: Record<FsPath, FsNode>, path: FsPath): void {
    for (const key of Object.keys(nodes)) {
      if (key === path || key.startsWith(`${path}/`)) {
        delete nodes[key];
      }
    }
  }

  private notify(): void {
    this.revision += 1;
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export function createNativeFileSystemProvider(
  options: NativeFileSystemProviderOptions,
): NativeFileSystemProvider {
  return new NativeFileSystemProvider(options);
}

export type { FsFolderNode };
