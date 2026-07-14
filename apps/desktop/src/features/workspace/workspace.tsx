import { useEffect } from 'react';

import { PanelChrome } from '@/components/atoms/panel-chrome';
import { useWorkspaceTabShortcuts } from '@/features/workspace/hooks/use-workspace-tab-shortcuts';
import { WorkspaceSplitView } from '@/features/workspace/organisms/workspace-split-view';
import { WorkspaceTabBar } from '@/features/workspace/organisms/workspace-tab-bar';
import { useFilesystemStore } from '@/modules/filesystem';
import { useWorkspaceStore } from '@/stores/workspace-store';

export function Workspace() {
  useWorkspaceTabShortcuts();
  const workspacePath = useFilesystemStore((state) => state.workspacePath);
  const bindSessionRoot = useWorkspaceStore((state) => state.bindSessionRoot);

  useEffect(() => {
    bindSessionRoot(workspacePath);
  }, [bindSessionRoot, workspacePath]);

  return (
    <PanelChrome className="min-w-0 flex-1">
      <WorkspaceTabBar />
      <div className="min-h-0 flex-1">
        <WorkspaceSplitView />
      </div>
    </PanelChrome>
  );
}
