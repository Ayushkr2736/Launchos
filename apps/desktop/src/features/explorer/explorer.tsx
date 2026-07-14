import { useEffect, useRef } from 'react';

import { PanelHeader } from '@/components/molecules/panel-header';
import { SearchField } from '@/components/molecules/search-field';
import { useExplorerFolderLoader } from '@/features/explorer/hooks/use-explorer-folder-loader';
import { ExplorerConnectionStatus } from '@/features/explorer/molecules/explorer-connection-status';
import { ExplorerEmptyState } from '@/features/explorer/molecules/explorer-empty-state';
import { ExplorerToolbar } from '@/features/explorer/molecules/explorer-toolbar';
import { ExplorerTree } from '@/features/explorer/organisms/explorer-tree';
import { useExplorerStore } from '@/stores/explorer-store';
import { useProjectStore } from '@/stores/project-store';
import { useWorkspaceStore } from '@/stores/workspace-store';

function useRevealActiveEditorFile(): void {
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const tabs = useWorkspaceStore((state) => state.tabs);
  const expandAncestors = useExplorerStore((state) => state.expandAncestors);
  const selectPath = useExplorerStore((state) => state.selectPath);
  const lastSynced = useRef<string | null>(null);

  useEffect(() => {
    if (!activeTabId || activeTabId === lastSynced.current) {
      return;
    }
    const tab = tabs.find((item) => item.id === activeTabId);
    if (!tab?.path || tab.kind !== 'file') {
      return;
    }
    lastSynced.current = activeTabId;
    expandAncestors(tab.path);
    selectPath(tab.path);
  }, [activeTabId, expandAncestors, selectPath, tabs]);
}

function ExplorerWorkbench() {
  const searchQuery = useExplorerStore((state) => state.searchQuery);
  const setSearchQuery = useExplorerStore((state) => state.setSearchQuery);
  const workspaceName = useProjectStore((state) => state.workspaceName);
  useExplorerFolderLoader();
  useRevealActiveEditorFile();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelHeader
        title={workspaceName ? `Explorer: ${workspaceName}` : 'Explorer'}
        actions={<ExplorerToolbar />}
      />
      <div className="border-border border-b p-2">
        <SearchField
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setSearchQuery('');
            }
          }}
          placeholder="Filter files"
          aria-label="Filter project explorer"
        />
      </div>
      <ExplorerConnectionStatus />
      <ExplorerTree />
    </div>
  );
}

export function Explorer() {
  const workspacePath = useProjectStore((state) => state.workspacePath);
  const bindProjectRoot = useExplorerStore((state) => state.bindProjectRoot);

  useEffect(() => {
    bindProjectRoot(workspacePath);
  }, [bindProjectRoot, workspacePath]);

  if (!workspacePath) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <PanelHeader title="Explorer" />
        <ExplorerEmptyState />
      </div>
    );
  }

  return <ExplorerWorkbench />;
}
