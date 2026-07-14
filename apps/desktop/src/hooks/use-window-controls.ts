import { useWindowManager } from '@/hooks/use-window-manager';

/** @deprecated Prefer `useWindowManager` for full window lifecycle control. */
export function useWindowControls() {
  const { isTauri, minimize, toggleMaximize, close, isMaximized } = useWindowManager();
  return { isTauri, minimize, toggleMaximize, close, isMaximized };
}
