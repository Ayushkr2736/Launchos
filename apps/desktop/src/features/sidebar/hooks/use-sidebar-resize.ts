import { useCallback, useEffect, useRef } from 'react';

import type { PointerEvent as ReactPointerEvent } from 'react';

import { SIDEBAR_EXPANDED_MIN } from '@/features/sidebar/constants';
import { SIDEBAR_SIZE } from '@/layout/constants';
import { useLayoutStore } from '@/stores/layout-store';

export function useSidebarResize(enabled: boolean) {
  const setSidebarWidth = useLayoutStore((state) => state.setSidebarWidth);
  const sidebarWidth = useLayoutStore((state) => state.sidebarWidth);
  const draggingRef = useRef(false);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled) {
        return;
      }
      event.preventDefault();
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      document.body.classList.add('sidebar-resizing');
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) {
        return;
      }
      const next = Math.min(SIDEBAR_SIZE.max, Math.max(SIDEBAR_EXPANDED_MIN, event.clientX));
      setSidebarWidth(next);
    },
    [setSidebarWidth],
  );

  const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) {
      return;
    }
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    document.body.classList.remove('sidebar-resizing');
  }, []);

  const nudge = useCallback(
    (delta: number) => {
      if (!enabled) {
        return;
      }
      setSidebarWidth(
        Math.min(SIDEBAR_SIZE.max, Math.max(SIDEBAR_EXPANDED_MIN, sidebarWidth + delta)),
      );
    },
    [enabled, setSidebarWidth, sidebarWidth],
  );

  useEffect(() => {
    return () => {
      document.body.classList.remove('sidebar-resizing');
    };
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    nudge,
  };
}
