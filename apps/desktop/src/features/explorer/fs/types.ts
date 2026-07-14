/** Absolute POSIX-style path inside the virtual project root. Root is `/`. */
export type FsPath = string;

export type FsNodeKind = 'file' | 'folder';

export interface FsNodeMeta {
  readonly path: FsPath;
  readonly name: string;
  readonly kind: FsNodeKind;
  readonly parentPath: FsPath | null;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface FsFileNode extends FsNodeMeta {
  readonly kind: 'file';
  readonly content: string;
}

export interface FsFolderNode extends FsNodeMeta {
  readonly kind: 'folder';
  readonly children: readonly FsPath[];
  /** Whether children have been loaded from the backing service. */
  readonly childrenLoaded?: boolean;
}

export type FsNode = FsFileNode | FsFolderNode;

export type FileSystemListener = () => void;

export interface IndexTreeProgress {
  readonly scannedFolders: number;
  readonly pendingFolders: number;
}

/**
 * Pluggable filesystem contract for the Explorer UI.
 * Reads are synchronous against an in-memory cache; mutations are async.
 */
export interface FileSystemProvider {
  readonly id: string;
  getRootPath: () => FsPath;
  /** Display label for the project root (folder basename). */
  getRootLabel: () => string;
  getNode: (path: FsPath) => FsNode | null;
  listChildren: (path: FsPath) => FsNode[];
  /** Whether a folder load is currently in flight. */
  isLoading: (path?: FsPath) => boolean;
  /** Load / refresh folder children into the cache. */
  loadFolder: (path: FsPath) => Promise<void>;
  /**
   * Recursively index folders for search (skips heavy directories).
   * Optional progress callback reports folder walk progress.
   */
  indexTree: (
    path?: FsPath,
    depth?: number,
    onProgress?: (progress: IndexTreeProgress) => void,
  ) => Promise<void>;
  /** Resolve a virtual explorer path to a native OS path when available. */
  resolveNativePath: (path: FsPath) => string | null;
  /** Read file body (lazy — not part of tree listings). */
  readFileContent: (path: FsPath) => Promise<string>;
  /** Persist file body and update the in-memory cache. */
  writeFileContent: (path: FsPath, content: string) => Promise<void>;
  createFile: (parentPath: FsPath, name: string, content?: string) => Promise<FsNode>;
  createFolder: (parentPath: FsPath, name: string) => Promise<FsNode>;
  rename: (path: FsPath, nextName: string) => Promise<FsNode>;
  delete: (path: FsPath) => Promise<void>;
  move: (path: FsPath, targetFolderPath: FsPath) => Promise<FsNode>;
  exists: (path: FsPath) => boolean;
  subscribe: (listener: FileSystemListener) => () => void;
  reset: () => void;
}

export class FileSystemError extends Error {
  readonly code:
    | 'NOT_FOUND'
    | 'ALREADY_EXISTS'
    | 'INVALID_NAME'
    | 'INVALID_TARGET'
    | 'NOT_A_FOLDER'
    | 'PERMISSION_DENIED'
    | 'IO_ERROR'
    | 'UNSUPPORTED';

  constructor(code: FileSystemError['code'], message: string) {
    super(message);
    this.name = 'FileSystemError';
    this.code = code;
  }
}
