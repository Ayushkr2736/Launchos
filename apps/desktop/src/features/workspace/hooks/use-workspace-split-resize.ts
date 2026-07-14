import { useCallback, useEffect, useRef } from 'react';

import type { PointerEvent as ReactPointerEvent } from 'react';

import { WORKSPACE_SPLIT_RATIO } from '@/features/workspace/constants';
import { useWorkspaceStore } from '@/stores/workspace-store';

export function useWorkspaceSplitResize(enabled: boolean) {
  const splitRatio = useWorkspaceStore((state) => state.splitRatio);
  const setSplitRatio = useWorkspaceStore((state) => state.setSplitRatio);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled) {
        return;
      }
      event.preventDefault();
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      document.body.classList.add('workspace-split-resizing');
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current || !containerRef.current) {
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0) {
        return;
      }
      const next = (event.clientX - rect.left) / rect.width;
      setSplitRatio(Math.min(WORKSPACE_SPLIT_RATIO.max, Math.max(WORKSPACE_SPLIT_RATIO.min, next)));
    },
    [setSplitRatio],
  );

  const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) {
      return;
    }
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    document.body.classList.remove('workspace-split-resizing');
  }, []);

  useEffect(() => {
    return () => {
      document.body.classList.remove('workspace-split-resizing');
    };
  }, []);

  return {
    containerRef,
    splitRatio,
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };
}
