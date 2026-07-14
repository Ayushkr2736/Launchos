export type {
  CreateFileOptions,
  FileSystemService,
  FsUnwatchFn,
  FsWatchEvent,
  FsWatchEventKind,
  NativeFsDirEntry,
  NativeFsEntryKind,
  NativeFsPath,
  NativeFsStat,
  OpenFileOptions,
  OpenFolderOptions,
  SaveAsOptions,
  WatchPathOptions,
  WorkspaceStatus,
} from '@/modules/filesystem/types';

export {
  FileSystemServiceError,
  isFileSystemServiceError,
  mapNativeFsError,
  describeWorkspaceError,
  workspaceErrorCode,
} from '@/modules/filesystem/services/errors';
export type { FileSystemServiceErrorCode } from '@/modules/filesystem/services/errors';

export {
  assertNonEmptyPath,
  assertValidEntryName,
  detectPathSeparator,
  getNativeBaseName,
  getNativeParentPath,
  joinNativePath,
  pathsEqual,
} from '@/modules/filesystem/services/path';

export {
  assertWorkspaceAccessible,
  toUserFacingFsError,
} from '@/modules/filesystem/services/workspace-access';

export { TauriFileSystemService } from '@/modules/filesystem/services/tauri-file-system-service';
export {
  createFileSystemService,
  fileSystemService,
} from '@/modules/filesystem/services/create-file-system-service';

export {
  FilesystemStore,
  useFilesystemStore,
  FILESYSTEM_STORAGE_KEY,
} from '@/modules/filesystem/stores/filesystem-store';
export type { FilesystemStoreState } from '@/modules/filesystem/stores/filesystem-store';

export {
  useFileSystemEngine,
  useWorkspaceFolder,
  useFileWatcher,
} from '@/modules/filesystem/hooks/useFileSystemEngine';
