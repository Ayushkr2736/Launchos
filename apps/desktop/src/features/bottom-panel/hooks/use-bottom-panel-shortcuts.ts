import { useCallback } from 'react';

import type { BottomPanelTabId } from '@/types/shell';

import { KEYBOARD } from '@/constants/keyboard';
import { BOTTOM_PANEL_TAB_CONFIG } from '@/features/bottom-panel/constants';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { layoutPanelApi } from '@/layout/panel-api';
import { useLayoutStore } from '@/stores/layout-store';
import { useTerminalStore } from '@/stores/terminal-store';

function cycleTab(current: BottomPanelTabId, delta: number): BottomPanelTabId {
  const ids = BOTTOM_PANEL_TAB_CONFIG.map((tab) => tab.id);
  const index = ids.indexOf(current);
  const next = (index + delta + ids.length) % ids.length;
  return ids[next] ?? current;
}

export function useBottomPanelShortcuts(): void {
  const bottomPanelTab = useLayoutStore((state) => state.bottomPanelTab);
  const setBottomPanelTab = useLayoutStore((state) => state.setBottomPanelTab);
  const expandBottomPanel = useLayoutStore((state) => state.expandBottomPanel);
  const focusActive = useTerminalStore((state) => state.focusActive);

  const openTab = useCallback(
    (tab: BottomPanelTabId) => {
      expandBottomPanel();
      setBottomPanelTab(tab);
    },
    [expandBottomPanel, setBottomPanelTab],
  );

  const onToggle = useCallback(() => {
    layoutPanelApi.toggle('bottom');
  }, []);

  const onTerminal = useCallback(() => {
    openTab('terminal');
    requestAnimationFrame(() => {
      focusActive();
    });
  }, [focusActive, openTab]);

  const onNext = useCallback(() => {
    expandBottomPanel();
    setBottomPanelTab(cycleTab(bottomPanelTab, 1));
  }, [bottomPanelTab, expandBottomPanel, setBottomPanelTab]);

  const onPrev = useCallback(() => {
    expandBottomPanel();
    setBottomPanelTab(cycleTab(bottomPanelTab, -1));
  }, [bottomPanelTab, expandBottomPanel, setBottomPanelTab]);

  useKeyboardShortcut(KEYBOARD.toggleBottomPanel, onToggle);
  useKeyboardShortcut(KEYBOARD.focusBottomTerminal, onTerminal);
  useKeyboardShortcut(KEYBOARD.cycleBottomPanelNext, onNext);
  useKeyboardShortcut(KEYBOARD.cycleBottomPanelPrev, onPrev);
}
