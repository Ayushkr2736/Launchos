/** Absolute filesystem path as returned by the OS / Tauri. */
export type NativeFsPath = string;

export type NativeFsEntryKind = 'file' | 'folder';

export type WorkspaceStatus = 'idle' | 'opening' | 'restoring' | 'ready' | 'error';

export interface OpenFolderOptions {
  readonly title?: string;
  readonly defaultPath?: NativeFsPath;
}

export interface OpenFileOptions {
  readonly title?: string;
  readonly defaultPath?: NativeFsPath;
  readonly multiple?: boolean;
  readonly filters?: readonly { readonly name: string; readonly extensions: string[] }[];
}

export interface SaveAsOptions {
  readonly title?: string;
  readonly defaultPath?: NativeFsPath;
  readonly filters?: readonly { readonly name: string; readonly extensions: string[] }[];
}

export interface CreateFileOptions {
  readonly content?: string;
}

export interface NativeFsDirEntry {
  readonly name: string;
  readonly kind: NativeFsEntryKind;
  readonly path: NativeFsPath;
}

export interface NativeFsStat {
  readonly kind: NativeFsEntryKind;
  readonly size: number | null;
  readonly modifiedAt: number | null;
  readonly createdAt: number | null;
}

export type FsWatchEventKind =
  'create' | 'modify' | 'remove' | 'rename' | 'access' | 'any' | 'other';

export interface FsWatchEvent {
  readonly kind: FsWatchEventKind;
  readonly paths: readonly NativeFsPath[];
}

export type FsUnwatchFn = () => void;

export interface WatchPathOptions {
  readonly recursive?: boolean;
  /** Debounce delay in ms. Omit / 0 for immediate events. */
  readonly delayMs?: number;
}

/**
 * Native filesystem operations for LaunchOS.
 * UI features depend on this contract — never call Tauri plugins from React directly.
 */
export interface FileSystemService {
  readonly id: string;

  /** Native folder picker. Returns `null` when the user cancels. */
  openFolder: (options?: OpenFolderOptions) => Promise<NativeFsPath | null>;

  /** Native file picker. Returns `null` when the user cancels. */
  openFile: (options?: OpenFileOptions) => Promise<NativeFsPath | null>;

  /** Native save dialog. Returns chosen path or `null` if cancelled. */
  saveAsDialog: (options?: SaveAsOptions) => Promise<NativeFsPath | null>;

  readFile: (path: NativeFsPath) => Promise<string>;

  /** Persist content to an existing or new path (create if missing). */
  writeFile: (path: NativeFsPath, content: string) => Promise<void>;

  /** Alias of `writeFile` for Save semantics. */
  saveFile: (path: NativeFsPath, content: string) => Promise<void>;

  /**
   * Save dialog + write. Returns the path written, or `null` if cancelled.
   */
  saveAs: (content: string, options?: SaveAsOptions) => Promise<NativeFsPath | null>;

  /** Renames the final path segment; returns the new absolute path. */
  rename: (path: NativeFsPath, nextName: string) => Promise<NativeFsPath>;

  /** Moves an entry into `targetFolderPath`, keeping its basename. */
  move: (path: NativeFsPath, targetFolderPath: NativeFsPath) => Promise<NativeFsPath>;

  /**
   * Copies a file or folder.
   * If `destination` is an existing folder, the entry is copied into it.
   * Otherwise `destination` is treated as the full destination path.
   */
  copy: (source: NativeFsPath, destination: NativeFsPath) => Promise<NativeFsPath>;

  /** Deletes a file or folder (folders removed recursively). */
  delete: (path: NativeFsPath) => Promise<void>;

  createFile: (
    parentPath: NativeFsPath,
    name: string,
    options?: CreateFileOptions,
  ) => Promise<NativeFsPath>;

  createFolder: (parentPath: NativeFsPath, name: string) => Promise<NativeFsPath>;

  readDir: (path: NativeFsPath) => Promise<readonly NativeFsDirEntry[]>;

  exists: (path: NativeFsPath) => Promise<boolean>;

  stat: (path: NativeFsPath) => Promise<NativeFsStat>;

  /** Watch a file or directory for changes. Returns an unwatch function. */
  watch: (
    path: NativeFsPath,
    onEvent: (event: FsWatchEvent) => void,
    options?: WatchPathOptions,
  ) => Promise<FsUnwatchFn>;
}
