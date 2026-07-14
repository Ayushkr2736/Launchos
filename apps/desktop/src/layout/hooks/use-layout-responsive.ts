import { useEffect } from 'react';

import type { LayoutBreakpoint } from '@/layout/types';

import { LAYOUT_BREAKPOINTS, LAYOUT_MIN_WIDTH } from '@/layout/constants';
import { useLayoutStore } from '@/stores/layout-store';

function resolveBreakpoint(width: number): LayoutBreakpoint {
  if (width >= LAYOUT_BREAKPOINTS.ultra) {
    return 'ultra';
  }
  if (width >= LAYOUT_BREAKPOINTS.wide) {
    return 'wide';
  }
  if (width >= LAYOUT_BREAKPOINTS.desktop) {
    return 'desktop';
  }
  return 'laptop';
}

/**
 * Tracks viewport breakpoint and applies a responsive collapse policy.
 * No domain/business logic — chrome density only.
 */
export function useLayoutResponsive(): LayoutBreakpoint {
  const breakpoint = useLayoutStore((state) => state.breakpoint);
  const setBreakpoint = useLayoutStore((state) => state.setBreakpoint);
  const collapseAiPanel = useLayoutStore((state) => state.collapseAiPanel);

  useEffect(() => {
    let previous = useLayoutStore.getState().breakpoint;

    const apply = () => {
      const width = Math.max(window.innerWidth, LAYOUT_MIN_WIDTH);
      const next = resolveBreakpoint(width);
      setBreakpoint(next);
      document.documentElement.dataset['layoutBreakpoint'] = next;

      // Entering laptop: prefer workspace width by collapsing AI when both side panels are open.
      if (previous !== 'laptop' && next === 'laptop') {
        const { explorerVisible, aiPanelVisible } = useLayoutStore.getState();
        if (explorerVisible && aiPanelVisible) {
          collapseAiPanel();
        }
      }

      previous = next;
    };

    apply();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
    };
  }, [collapseAiPanel, setBreakpoint]);

  return breakpoint;
}
