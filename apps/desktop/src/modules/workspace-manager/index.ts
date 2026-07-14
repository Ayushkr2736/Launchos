export type {
  WorkspaceEntry,
  WorkspaceId,
  WorkspaceManagerStatus,
  WorkspaceMetadata,
  WorkspaceSettings,
} from '@/modules/workspace-manager/types';
export { DEFAULT_WORKSPACE_SETTINGS } from '@/modules/workspace-manager/types';

export {
  WORKSPACE_MANAGER_STORAGE_KEY,
  WORKSPACE_PINNED_MAX,
  WORKSPACE_RECENT_MAX,
} from '@/modules/workspace-manager/constants';

export {
  createWorkspaceEntry,
  resolveWorkspaceMetadata,
  toWorkspaceId,
  upsertPinnedList,
  upsertRecentList,
} from '@/modules/workspace-manager/services/workspace-service';

export {
  useWorkspaceManagerStore,
  WorkspaceStore,
} from '@/modules/workspace-manager/stores/workspace-manager-store';
export type { WorkspaceManagerStoreState } from '@/modules/workspace-manager/stores/workspace-manager-store';

export {
  useActiveWorkspace,
  useRestoreLastWorkspace,
  useWorkspaceCatalog,
  useWorkspaceManager,
  useWorkspaceSettings,
} from '@/modules/workspace-manager/hooks/useWorkspaceManager';
