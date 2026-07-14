import { useCallback } from 'react';

import { KEYBOARD } from '@/constants/keyboard';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { useLayoutStore } from '@/stores/layout-store';

/** ⌘⇧G — open Source Control in the bottom panel. */
export function useGitShortcut(): void {
  const expandBottomPanel = useLayoutStore((state) => state.expandBottomPanel);
  const setBottomPanelTab = useLayoutStore((state) => state.setBottomPanelTab);

  const onOpen = useCallback(() => {
    expandBottomPanel();
    setBottomPanelTab('git');
  }, [expandBottomPanel, setBottomPanelTab]);

  useKeyboardShortcut(KEYBOARD.focusSourceControl, onOpen);
}
