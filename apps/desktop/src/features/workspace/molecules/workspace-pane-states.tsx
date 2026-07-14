import { AlertTriangle, FileStack, LoaderCircle } from 'lucide-react';

import type { WorkspacePaneId } from '@/types/shell';
import type { ReactNode } from 'react';

import { EmptyState } from '@/components/molecules/empty-state';
import { useWorkspaceStore } from '@/stores/workspace-store';

interface WorkspacePaneStatesProps {
  paneId: WorkspacePaneId;
  children: ReactNode;
}

export function WorkspacePaneStates({ paneId, children }: WorkspacePaneStatesProps) {
  const pane = useWorkspaceStore((state) => state.panes[paneId]);
  const openTab = useWorkspaceStore((state) => state.openTab);
  const setPaneViewState = useWorkspaceStore((state) => state.setPaneViewState);
  const focusPane = useWorkspaceStore((state) => state.focusPane);

  if (pane.viewState === 'loading') {
    return (
      <EmptyState
        icon={LoaderCircle}
        title="Loading editor"
        description="Preparing the active surface."
      />
    );
  }

  if (pane.viewState === 'error') {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Editor failed to load"
        description={
          pane.errorMessage ?? 'An unexpected error occurred while rendering this editor.'
        }
        actionLabel="Retry"
        onAction={() => {
          focusPane(paneId);
          setPaneViewState(paneId, pane.activeTabId ? 'ready' : 'empty');
        }}
      />
    );
  }

  if (pane.viewState === 'empty' || !pane.activeTabId) {
    return (
      <EmptyState
        icon={FileStack}
        title="No editor open"
        description="Open a file from the explorer, or create an untitled tab."
        actionLabel="New tab"
        onAction={() => {
          focusPane(paneId);
          openTab(
            {
              id: crypto.randomUUID(),
              title: 'Untitled',
              closable: true,
              kind: 'untitled',
            },
            paneId,
          );
        }}
      />
    );
  }

  return <>{children}</>;
}
