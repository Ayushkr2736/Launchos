import { Columns2, FilePlus, PanelLeftClose } from 'lucide-react';

import { IconButton } from '@/components/atoms/icon-button';
import { tabCommands } from '@/features/workspace/services/tab-commands';
import { useWorkspaceStore } from '@/stores/workspace-store';

export function WorkspaceToolbar() {
  const splitEnabled = useWorkspaceStore((state) => state.splitEnabled);
  const toggleSplit = useWorkspaceStore((state) => state.toggleSplit);

  return (
    <div className="border-border bg-muted/20 flex h-8 shrink-0 items-center gap-0.5 border-b px-1">
      <IconButton
        size="sm"
        aria-label="New untitled tab"
        title="New Untitled Tab"
        onClick={() => {
          tabCommands.openUntitled();
        }}
      >
        <FilePlus className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton
        size="sm"
        aria-label={splitEnabled ? 'Close split view' : 'Split editor right'}
        title={splitEnabled ? 'Close Split' : 'Split Editor Right'}
        aria-pressed={splitEnabled}
        onClick={() => {
          toggleSplit();
        }}
      >
        {splitEnabled ? (
          <PanelLeftClose className="h-3.5 w-3.5" />
        ) : (
          <Columns2 className="h-3.5 w-3.5" />
        )}
      </IconButton>
    </div>
  );
}
