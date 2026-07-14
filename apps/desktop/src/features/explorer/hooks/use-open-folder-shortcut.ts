import { useCallback } from 'react';

import { KEYBOARD } from '@/constants/keyboard';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { useWorkspaceManagerStore } from '@/modules/workspace-manager';
import { useSidebarStore } from '@/stores/sidebar-store';

/** Global Open Folder shortcut (⌘O / Ctrl+O). */
export function useOpenFolderShortcut(): void {
  const openWorkspace = useWorkspaceManagerStore((state) => state.openWorkspace);
  const setActiveSection = useSidebarStore((state) => state.setActiveSection);

  const onOpenFolder = useCallback(() => {
    void (async () => {
      const entry = await openWorkspace();
      if (!entry) {
        return;
      }
      setActiveSection('code');
    })();
  }, [openWorkspace, setActiveSection]);

  useKeyboardShortcut(KEYBOARD.openFolder, onOpenFolder);
}
