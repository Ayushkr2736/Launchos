import type { WorkspacePaneId, WorkspacePaneState } from '@/types/shell';

export const WORKSPACE_TAB_DND_MIME = 'application/x-launchos-workspace-tab';

export const WORKSPACE_SPLIT_RATIO = {
  min: 0.25,
  max: 0.75,
  default: 0.5,
} as const;

export const WORKSPACE_PANE_IDS = [
  'primary',
  'secondary',
] as const satisfies readonly WorkspacePaneId[];

export function createPaneState(
  id: WorkspacePaneId,
  activeTabId: string | null = null,
): WorkspacePaneState {
  return {
    id,
    activeTabId,
    viewState: activeTabId ? 'ready' : 'empty',
    errorMessage: null,
  };
}
