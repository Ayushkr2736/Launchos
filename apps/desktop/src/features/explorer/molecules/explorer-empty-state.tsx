import { Button } from '@launchos/ui';
import { FolderOpen, Loader2, ShieldAlert } from 'lucide-react';

import { EmptyState } from '@/components/molecules/empty-state';
import { useExplorerActions } from '@/features/explorer/hooks/use-explorer-actions';
import { useWorkspaceManagerStore } from '@/modules/workspace-manager';
import { useProjectStore } from '@/stores/project-store';

const ACCESS_HINT = 'Folders must be under Home, Documents, Desktop, or Downloads.';

export function ExplorerEmptyState() {
  const actions = useExplorerActions();
  const status = useProjectStore((state) => state.status);
  const errorMessage = useProjectStore((state) => state.errorMessage);
  const errorCode = useProjectStore((state) => state.errorCode);
  const lastWorkspacePath = useProjectStore((state) => state.lastWorkspacePath);
  const restoreLastWorkspace = useWorkspaceManagerStore((state) => state.restoreLastWorkspace);
  const wmStatus = useWorkspaceManagerStore((state) => state.status);
  const wmError = useWorkspaceManagerStore((state) => state.errorMessage);

  const opening = status === 'opening';
  const restoring = status === 'restoring';
  const switching = wmStatus === 'switching';
  const busy = opening || restoring || switching;
  const permissionDenied = errorCode === 'PERMISSION_DENIED';
  const displayError = errorMessage ?? wmError;

  if (restoring || (switching && Boolean(lastWorkspacePath) && !displayError)) {
    return (
      <EmptyState
        icon={Loader2}
        title="Restoring session"
        description={
          lastWorkspacePath ? `Reopening ${lastWorkspacePath}` : 'Checking the last opened folder…'
        }
        className="[&_svg]:animate-spin"
      />
    );
  }

  const title = displayError
    ? permissionDenied
      ? 'Permission denied'
      : 'Could not open folder'
    : 'No folder open';

  const description = displayError
    ? displayError
    : 'Open or choose a local folder to generate the file tree. Your last session restores automatically on launch.';

  return (
    <EmptyState
      icon={permissionDenied ? ShieldAlert : FolderOpen}
      title={title}
      description={description}
    >
      <p className="text-muted-foreground max-w-sm text-xs">{ACCESS_HINT}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy}
          onClick={() => {
            void actions.openProjectFolder();
          }}
        >
          {opening ? 'Opening…' : 'Open Folder…'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => {
            void actions.openProjectFolder();
          }}
        >
          Choose Folder…
        </Button>
        {lastWorkspacePath ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              void restoreLastWorkspace();
            }}
          >
            {displayError ? 'Retry session' : 'Restore last folder'}
          </Button>
        ) : null}
      </div>
    </EmptyState>
  );
}
