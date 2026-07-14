/**
 * @deprecated Import from `@/modules/filesystem` for new code.
 * Compatibility shim for existing explorer / project / editor imports.
 */
export {
  createFileSystemService,
  fileSystemService,
  FileSystemServiceError,
  isFileSystemServiceError,
  mapNativeFsError,
  TauriFileSystemService,
  assertNonEmptyPath,
  assertValidEntryName,
  detectPathSeparator,
  getNativeBaseName,
  getNativeParentPath,
  joinNativePath,
  pathsEqual,
  assertWorkspaceAccessible,
  describeWorkspaceError,
  workspaceErrorCode,
  toUserFacingFsError,
} from '@/modules/filesystem';

export type {
  CreateFileOptions,
  FileSystemService,
  FileSystemServiceErrorCode,
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
} from '@/modules/filesystem';
