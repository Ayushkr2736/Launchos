import { useCallback } from 'react';

import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { useWindowManager } from '@/hooks/use-window-manager';
import { WINDOW_KEYBOARD } from '@/window/constants';

export function useWindowShortcuts(): void {
  const { isTauri, minimize, toggleMaximize, close } = useWindowManager();

  const onMinimize = useCallback(() => {
    void minimize();
  }, [minimize]);

  const onToggleMaximize = useCallback(() => {
    void toggleMaximize();
  }, [toggleMaximize]);

  const onClose = useCallback(() => {
    void close();
  }, [close]);

  useKeyboardShortcut(WINDOW_KEYBOARD.minimize, onMinimize, isTauri);
  useKeyboardShortcut(WINDOW_KEYBOARD.toggleMaximize, onToggleMaximize, isTauri);
  useKeyboardShortcut(WINDOW_KEYBOARD.close, onClose, isTauri);
}
