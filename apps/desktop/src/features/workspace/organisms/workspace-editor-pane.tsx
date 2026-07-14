import { cn } from '@launchos/ui';

import type { WorkspacePaneId } from '@/types/shell';

import { useWorkspaceTabDnD } from '@/features/workspace/hooks/use-workspace-tab-dnd';
import { WorkspaceEditorSurface } from '@/features/workspace/molecules/workspace-editor-surface';
import { WorkspacePaneStates } from '@/features/workspace/molecules/workspace-pane-states';
import { useWorkspaceStore } from '@/stores/workspace-store';

interface WorkspaceEditorPaneProps {
  paneId: WorkspacePaneId;
  className?: string;
}

export function WorkspaceEditorPane({ paneId, className }: WorkspaceEditorPaneProps) {
  const pane = useWorkspaceStore((state) => state.panes[paneId]);
  const tabs = useWorkspaceStore((state) => state.tabs);
  const focusedPaneId = useWorkspaceStore((state) => state.focusedPaneId);
  const focusPane = useWorkspaceStore((state) => state.focusPane);
  const { onPaneDragOver, onPaneDrop } = useWorkspaceTabDnD();

  const activeTab = tabs.find((tab) => tab.id === pane.activeTabId) ?? null;
  const focused = focusedPaneId === paneId;

  return (
    <section
      aria-label={paneId === 'primary' ? 'Primary editor' : 'Secondary editor'}
      data-workspace-pane={paneId}
      data-focused={focused ? 'true' : 'false'}
      onMouseDown={() => {
        focusPane(paneId);
      }}
      onDragOver={onPaneDragOver}
      onDrop={(event) => {
        onPaneDrop(event, paneId);
      }}
      className={cn(
        'bg-background flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
        focused && 'shadow-[inset_2px_0_0_0_hsl(var(--ring))]',
        className,
      )}
    >
      <WorkspacePaneStates paneId={paneId}>
        {activeTab ? <WorkspaceEditorSurface tab={activeTab} /> : null}
      </WorkspacePaneStates>
    </section>
  );
}
