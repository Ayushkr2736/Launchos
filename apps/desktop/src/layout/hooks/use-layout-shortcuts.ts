import { useCallback } from 'react';

import { KEYBOARD } from '@/constants/keyboard';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { layoutPanelApi } from '@/layout/panel-api';
import { useLayoutStore } from '@/stores/layout-store';
import { useThemeStore } from '@/stores/theme-store';

export function useLayoutShortcuts(): void {
  const toggleCommandPalette = useLayoutStore((state) => state.toggleCommandPalette);
  const cycleMode = useThemeStore((state) => state.cycleMode);

  const onToggleSidebar = useCallback(() => {
    layoutPanelApi.toggle('sidebar');
  }, []);
  const onToggleAi = useCallback(() => {
    layoutPanelApi.toggle('ai');
  }, []);
  const onToggleExplorer = useCallback(() => {
    layoutPanelApi.toggle('explorer');
  }, []);
  const onTogglePalette = useCallback(() => {
    toggleCommandPalette();
  }, [toggleCommandPalette]);
  const onToggleTheme = useCallback(() => {
    cycleMode();
  }, [cycleMode]);

  useKeyboardShortcut(KEYBOARD.toggleSidebar, onToggleSidebar);
  useKeyboardShortcut(KEYBOARD.toggleAiPanel, onToggleAi);
  useKeyboardShortcut(KEYBOARD.toggleExplorer, onToggleExplorer);
  // Palette must open from inputs/editors as well (Cursor behavior).
  useKeyboardShortcut(KEYBOARD.commandPalette, onTogglePalette, true, { allowInInputs: true });
  useKeyboardShortcut(KEYBOARD.toggleTheme, onToggleTheme);
}
