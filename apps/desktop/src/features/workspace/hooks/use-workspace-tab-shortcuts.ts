import { useCallback, useEffect } from 'react';

import { KEYBOARD } from '@/constants/keyboard';
import { tabCommands } from '@/features/workspace/services/tab-commands';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { useWorkspaceStore } from '@/stores/workspace-store';

/**
 * Editor tab keyboard shortcuts (work inside Monaco via allowInInputs).
 */
export function useWorkspaceTabShortcuts(): void {
  const cycleTab = useWorkspaceStore((state) => state.cycleTab);
  const toggleSplit = useWorkspaceStore((state) => state.toggleSplit);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);

  const onClose = useCallback(() => {
    if (!activeTabId) {
      return;
    }
    void tabCommands.close(activeTabId);
  }, [activeTabId]);

  const onCloseOthers = useCallback(() => {
    if (!activeTabId) {
      return;
    }
    void tabCommands.closeOthers(activeTabId);
  }, [activeTabId]);

  const onCloseAll = useCallback(() => {
    void tabCommands.closeAll();
  }, []);

  const onCloseLeft = useCallback(() => {
    if (!activeTabId) {
      return;
    }
    void tabCommands.closeLeft(activeTabId);
  }, [activeTabId]);

  const onCloseRight = useCallback(() => {
    if (!activeTabId) {
      return;
    }
    void tabCommands.closeRight(activeTabId);
  }, [activeTabId]);

  const onNext = useCallback(() => {
    cycleTab(1);
  }, [cycleTab]);

  const onPrevious = useCallback(() => {
    cycleTab(-1);
  }, [cycleTab]);

  const onPin = useCallback(() => {
    if (!activeTabId) {
      return;
    }
    tabCommands.pin(activeTabId);
  }, [activeTabId]);

  const onDuplicate = useCallback(() => {
    if (!activeTabId) {
      return;
    }
    tabCommands.duplicate(activeTabId);
  }, [activeTabId]);

  const onReopen = useCallback(() => {
    tabCommands.reopenClosed();
  }, []);

  const onSplit = useCallback(() => {
    toggleSplit();
  }, [toggleSplit]);

  useKeyboardShortcut(KEYBOARD.closeEditor, onClose, true, { allowInInputs: true });
  useKeyboardShortcut(KEYBOARD.closeOtherEditors, onCloseOthers, true, { allowInInputs: true });
  useKeyboardShortcut(KEYBOARD.closeAllEditors, onCloseAll, true, { allowInInputs: true });
  useKeyboardShortcut(KEYBOARD.closeEditorsToTheLeft, onCloseLeft, true, { allowInInputs: true });
  useKeyboardShortcut(KEYBOARD.closeEditorsToTheRight, onCloseRight, true, {
    allowInInputs: true,
  });
  useKeyboardShortcut(KEYBOARD.nextEditor, onNext, true, { allowInInputs: true });
  useKeyboardShortcut(KEYBOARD.previousEditor, onPrevious, true, { allowInInputs: true });
  useKeyboardShortcut(KEYBOARD.pinEditor, onPin, true, { allowInInputs: true });
  useKeyboardShortcut(KEYBOARD.duplicateEditor, onDuplicate, true, { allowInInputs: true });
  useKeyboardShortcut(KEYBOARD.reopenClosedEditor, onReopen, true, { allowInInputs: true });
  useKeyboardShortcut(KEYBOARD.toggleSplitEditor, onSplit, true, { allowInInputs: true });

  // ⌘1–⌘9 → switch to Nth editor tab
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) {
        return;
      }
      if (event.key < '1' || event.key > '9') {
        return;
      }
      event.preventDefault();
      tabCommands.switchToIndex(Number(event.key) - 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);
}
