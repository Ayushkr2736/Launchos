import { useCallback } from 'react';

import type { WindowResizeEdge } from '@/window/types';

import { useWindowStore } from '@/stores/window-store';
import {
  closeWindow,
  maximizeWindow,
  minimizeWindow,
  restoreWindow,
  startWindowDrag,
  startWindowResize,
  toggleMaximizeWindow,
} from '@/window/native';

export function useWindowManager() {
  const isTauri = useWindowStore((state) => state.isTauri);
  const isMaximized = useWindowStore((state) => state.isMaximized);
  const isMinimized = useWindowStore((state) => state.isMinimized);
  const isFocused = useWindowStore((state) => state.isFocused);
  const width = useWindowStore((state) => state.width);
  const height = useWindowStore((state) => state.height);
  const scaleFactor = useWindowStore((state) => state.scaleFactor);

  const minimize = useCallback(async () => {
    if (!isTauri) {
      return;
    }
    await minimizeWindow();
  }, [isTauri]);

  const maximize = useCallback(async () => {
    if (!isTauri) {
      return;
    }
    await maximizeWindow();
  }, [isTauri]);

  const restore = useCallback(async () => {
    if (!isTauri) {
      return;
    }
    await restoreWindow();
  }, [isTauri]);

  const toggleMaximize = useCallback(async () => {
    if (!isTauri) {
      return;
    }
    await toggleMaximizeWindow();
  }, [isTauri]);

  const close = useCallback(async () => {
    if (!isTauri) {
      return;
    }
    await closeWindow();
  }, [isTauri]);

  const startDragging = useCallback(async () => {
    if (!isTauri) {
      return;
    }
    await startWindowDrag();
  }, [isTauri]);

  const startResizing = useCallback(
    async (edge: WindowResizeEdge) => {
      if (!isTauri || isMaximized) {
        return;
      }
      await startWindowResize(edge);
    },
    [isMaximized, isTauri],
  );

  return {
    isTauri,
    isMaximized,
    isMinimized,
    isFocused,
    width,
    height,
    scaleFactor,
    minimize,
    maximize,
    restore,
    toggleMaximize,
    close,
    startDragging,
    startResizing,
  };
}
