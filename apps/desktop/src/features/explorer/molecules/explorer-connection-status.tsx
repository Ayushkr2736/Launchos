import { cn } from '@launchos/ui';
import { Loader2 } from 'lucide-react';

import { useExplorerStore } from '@/stores/explorer-store';
import { useProjectStore } from '@/stores/project-store';

/**
 * Thin status strip: opening/restoring workspace, loading tree, indexing progress.
 */
export function ExplorerConnectionStatus() {
  const workspaceStatus = useProjectStore((state) => state.status);
  const connectionStatus = useExplorerStore((state) => state.connectionStatus);
  const indexProgress = useExplorerStore((state) => state.indexProgress);
  const loadingPaths = useExplorerStore((state) => state.loadingPaths);

  const opening = workspaceStatus === 'opening' || workspaceStatus === 'restoring';
  const loadingTree = connectionStatus === 'loading' || loadingPaths.length > 0;
  const indexing = connectionStatus === 'indexing';

  if (!opening && !loadingTree && !indexing) {
    return null;
  }

  let label = 'Loading workspace…';
  let ratio: number | null = null;

  if (workspaceStatus === 'opening') {
    label = 'Opening folder…';
  } else if (workspaceStatus === 'restoring') {
    label = 'Restoring session…';
  } else if (indexing) {
    const scanned = indexProgress?.scannedFolders ?? 0;
    const pending = indexProgress?.pendingFolders ?? 0;
    const total = scanned + pending;
    label =
      total > 0 ? `Indexing folders… ${scanned}/${Math.max(total, scanned)}` : 'Indexing folders…';
    ratio = total > 0 ? scanned / Math.max(total, 1) : null;
  } else if (loadingTree) {
    label =
      loadingPaths.length > 1
        ? `Reading folders… (${loadingPaths.length})`
        : 'Generating file tree…';
  }

  return (
    <div
      className="border-border bg-muted/30 flex flex-col gap-1 border-b px-2 py-1.5"
      role="status"
      aria-live="polite"
    >
      <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
        <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </div>
      <div className="bg-border h-0.5 overflow-hidden rounded-full">
        <div
          className={cn(
            'bg-primary/70 h-full rounded-full transition-[width] duration-200 ease-out',
            ratio === null && 'w-1/3 animate-pulse',
          )}
          style={ratio === null ? undefined : { width: `${Math.max(8, Math.round(ratio * 100))}%` }}
        />
      </div>
    </div>
  );
}
