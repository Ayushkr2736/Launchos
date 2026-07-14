import { cn } from '@launchos/ui';
import { useEffect } from 'react';

import { useWorkspaceSplitResize } from '@/features/workspace/hooks/use-workspace-split-resize';
import { WorkspaceEditorPane } from '@/features/workspace/organisms/workspace-editor-pane';
import { useWorkspaceStore } from '@/stores/workspace-store';

export function WorkspaceSplitView() {
  const splitEnabled = useWorkspaceStore((state) => state.splitEnabled);
  const resize = useWorkspaceSplitResize(splitEnabled);

  useEffect(() => {
    const node = resize.containerRef.current;
    if (!node) {
      return;
    }
    const left = `${Math.round(resize.splitRatio * 1000) / 10}%`;
    const right = `${Math.round((1 - resize.splitRatio) * 1000) / 10}%`;
    node.style.setProperty('--workspace-split-primary', left);
    node.style.setProperty('--workspace-split-secondary', right);
  }, [resize.containerRef, resize.splitRatio]);

  if (!splitEnabled) {
    return (
      <div className="workspace-split-root flex min-h-0 flex-1" data-split="false">
        <WorkspaceEditorPane paneId="primary" />
      </div>
    );
  }

  const leftPercent = Math.round(resize.splitRatio * 100);

  return (
    <div
      ref={resize.containerRef}
      className="workspace-split-root flex min-h-0 flex-1"
      data-split="true"
    >
      <WorkspaceEditorPane paneId="primary" />
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize split editors"
        aria-valuemin={25}
        aria-valuemax={75}
        aria-valuenow={leftPercent}
        tabIndex={0}
        className={cn(
          'bg-border z-10 w-1 shrink-0 cursor-col-resize transition-colors',
          'hover:bg-ring/60 focus-visible:bg-ring focus-visible:outline-none',
        )}
        onPointerDown={resize.onPointerDown}
        onPointerMove={resize.onPointerMove}
        onPointerUp={resize.onPointerUp}
        onPointerCancel={resize.onPointerCancel}
      />
      <WorkspaceEditorPane paneId="secondary" />
    </div>
  );
}
