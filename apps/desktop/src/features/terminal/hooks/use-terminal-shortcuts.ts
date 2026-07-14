import { useCallback } from 'react';

import { KEYBOARD } from '@/constants/keyboard';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { useLayoutStore } from '@/stores/layout-store';
import { useProjectStore } from '@/stores/project-store';
import { useTerminalStore } from '@/stores/terminal-store';

/** Terminal-specific shortcuts (panel focus stays in bottom-panel shortcuts). */
export function useTerminalShortcuts(): void {
  const expandBottomPanel = useLayoutStore((state) => state.expandBottomPanel);
  const setBottomPanelTab = useLayoutStore((state) => state.setBottomPanelTab);
  const workspacePath = useProjectStore((state) => state.workspacePath);
  const createSession = useTerminalStore((state) => state.createSession);
  const clearActive = useTerminalStore((state) => state.clearActive);

  const onNew = useCallback(() => {
    expandBottomPanel();
    setBottomPanelTab('terminal');
    createSession({ cwd: workspacePath });
  }, [createSession, expandBottomPanel, setBottomPanelTab, workspacePath]);

  const onClear = useCallback(() => {
    expandBottomPanel();
    setBottomPanelTab('terminal');
    clearActive();
  }, [clearActive, expandBottomPanel, setBottomPanelTab]);

  useKeyboardShortcut(KEYBOARD.newTerminal, onNew);
  useKeyboardShortcut(KEYBOARD.clearTerminal, onClear);
}
