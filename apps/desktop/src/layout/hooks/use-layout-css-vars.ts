import { useLayoutEffect } from 'react';

import { LAYOUT_MIN_WIDTH } from '@/layout/constants';
import { useLayoutStore } from '@/stores/layout-store';

/** Sync layout CSS variables before paint so sidebar width never lags behind store state. */
export function useLayoutCssVars(): void {
  const sidebarWidth = useLayoutStore((state) => state.sidebarWidth);
  const explorerWidth = useLayoutStore((state) => state.explorerWidth);
  const aiPanelWidth = useLayoutStore((state) => state.aiPanelWidth);
  const bottomPanelHeight = useLayoutStore((state) => state.bottomPanelHeight);
  const bottomPanelCollapsed = useLayoutStore((state) => state.bottomPanelCollapsed);
  const breakpoint = useLayoutStore((state) => state.breakpoint);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--layout-min-width', `${LAYOUT_MIN_WIDTH}px`);
    root.style.setProperty('--layout-sidebar-width', `${sidebarWidth}px`);
    root.style.setProperty('--layout-explorer-width', `${explorerWidth}px`);
    root.style.setProperty('--layout-ai-panel-width', `${aiPanelWidth}px`);
    root.style.setProperty(
      '--layout-bottom-panel-height',
      bottomPanelCollapsed ? '36px' : `${bottomPanelHeight}px`,
    );
    root.dataset['layoutBreakpoint'] = breakpoint;

    root.style.setProperty('--shell-sidebar-width', `${sidebarWidth}px`);
    root.style.setProperty('--shell-explorer-width', `${explorerWidth}px`);
    root.style.setProperty('--shell-ai-panel-width', `${aiPanelWidth}px`);
    root.style.setProperty(
      '--shell-bottom-panel-height',
      bottomPanelCollapsed ? '36px' : `${bottomPanelHeight}px`,
    );
  }, [
    aiPanelWidth,
    bottomPanelCollapsed,
    bottomPanelHeight,
    breakpoint,
    explorerWidth,
    sidebarWidth,
  ]);
}
