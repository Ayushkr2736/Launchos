/**
 * @deprecated Prefer `useFilesystemStore` from `@/modules/filesystem`.
 * Thin compatibility shim — same storage key and API as before.
 */
export {
  useFilesystemStore as useProjectStore,
  FILESYSTEM_STORAGE_KEY as PROJECT_STORAGE_KEY,
} from '@/modules/filesystem';

export type { WorkspaceStatus as ProjectStatus } from '@/modules/filesystem';
export type { FilesystemStoreState as ProjectStoreState } from '@/modules/filesystem';
