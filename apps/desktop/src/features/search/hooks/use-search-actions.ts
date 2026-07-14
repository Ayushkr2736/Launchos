import { useCallback } from 'react';

import type { SearchFileResult, SearchLineMatch } from '@/features/search/types';

import { layoutPanelApi } from '@/layout/panel-api';
import { useEditorRevealStore } from '@/stores/editor-reveal-store';
import { useExplorerStore } from '@/stores/explorer-store';
import { useLayoutStore } from '@/stores/layout-store';
import { useRecentFilesStore } from '@/stores/recent-files-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useWorkspaceStore } from '@/stores/workspace-store';

export function useSearchActions() {
  const openTab = useWorkspaceStore((state) => state.openTab);
  const selectPath = useExplorerStore((state) => state.selectPath);
  const expandAncestors = useExplorerStore((state) => state.expandAncestors);
  const addRecentFile = useRecentFilesStore((state) => state.addRecentFile);
  const setActiveSection = useSidebarStore((state) => state.setActiveSection);
  const setLeftPanelTab = useLayoutStore((state) => state.setLeftPanelTab);
  const setReveal = useEditorRevealStore((state) => state.setReveal);

  const openSearchPanel = useCallback(() => {
    layoutPanelApi.expand('explorer');
    setLeftPanelTab('search');
    setActiveSection('code');
  }, [setActiveSection, setLeftPanelTab]);

  const openFileResult = useCallback(
    (file: SearchFileResult, match?: SearchLineMatch) => {
      if (match) {
        setReveal({
          path: file.path,
          lineNumber: match.lineNumber,
          column: match.column,
        });
      }
      selectPath(file.path);
      expandAncestors(file.path);
      openTab({
        id: file.path,
        title: file.name,
        closable: true,
        kind: 'file',
        path: file.path,
      });
      addRecentFile({ id: file.path, name: file.name, path: file.path });
      setActiveSection('code');
    },
    [addRecentFile, expandAncestors, openTab, selectPath, setActiveSection, setReveal],
  );

  return {
    openSearchPanel,
    openFileResult,
  };
}
