export {
  createFileSystemService,
  fileSystemService,
  FileSystemServiceError,
  isFileSystemServiceError,
  TauriFileSystemService,
  assertWorkspaceAccessible,
  describeWorkspaceError,
  workspaceErrorCode,
  getNativeBaseName,
  joinNativePath,
} from '@/modules/filesystem';

export type {
  CreateFileOptions,
  FileSystemService,
  FileSystemServiceErrorCode,
  NativeFsPath,
  OpenFolderOptions,
  WorkspaceStatus,
} from '@/modules/filesystem';
