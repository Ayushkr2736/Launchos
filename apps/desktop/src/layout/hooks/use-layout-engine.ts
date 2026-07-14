import type { LayoutBreakpoint } from '@/layout/types';

import { useOpenFolderShortcut } from '@/features/explorer/hooks/use-open-folder-shortcut';
import { useRestoreWorkspace } from '@/features/explorer/hooks/use-restore-workspace';
import { useSearchShortcut } from '@/features/search/hooks/use-search-shortcut';
import { useLayoutCssVars } from '@/layout/hooks/use-layout-css-vars';
import { useLayoutResponsive } from '@/layout/hooks/use-layout-responsive';
import { useLayoutShortcuts } from '@/layout/hooks/use-layout-shortcuts';
import { useLayoutStore } from '@/stores/layout-store';

export interface LayoutEngineState {
  breakpoint: LayoutBreakpoint;
  explorerVisible: boolean;
  aiPanelVisible: boolean;
  explorerWidth: number;
  aiPanelWidth: number;
  bottomPanelHeight: number;
  bottomPanelCollapsed: boolean;
  setExplorerWidth: (width: number) => void;
  setAiPanelWidth: (width: number) => void;
  setBottomPanelHeight: (height: number) => void;
}

/** Boots layout chrome: CSS vars, responsive policy, keyboard shortcuts. */
export function useLayoutEngine(): LayoutEngineState {
  useLayoutCssVars();
  useLayoutShortcuts();
  useOpenFolderShortcut();
  useSearchShortcut();
  useRestoreWorkspace();
  const breakpoint = useLayoutResponsive();

  const explorerVisible = useLayoutStore((state) => state.explorerVisible);
  const aiPanelVisible = useLayoutStore((state) => state.aiPanelVisible);
  const explorerWidth = useLayoutStore((state) => state.explorerWidth);
  const aiPanelWidth = useLayoutStore((state) => state.aiPanelWidth);
  const bottomPanelHeight = useLayoutStore((state) => state.bottomPanelHeight);
  const bottomPanelCollapsed = useLayoutStore((state) => state.bottomPanelCollapsed);
  const setExplorerWidth = useLayoutStore((state) => state.setExplorerWidth);
  const setAiPanelWidth = useLayoutStore((state) => state.setAiPanelWidth);
  const setBottomPanelHeight = useLayoutStore((state) => state.setBottomPanelHeight);

  return {
    breakpoint,
    explorerVisible,
    aiPanelVisible,
    explorerWidth,
    aiPanelWidth,
    bottomPanelHeight,
    bottomPanelCollapsed,
    setExplorerWidth,
    setAiPanelWidth,
    setBottomPanelHeight,
  };
}
