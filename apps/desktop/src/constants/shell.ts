import type { AiPanelTabId } from '@/types/shell';

import {
  AI_PANEL_SIZE,
  BOTTOM_PANEL_SIZE,
  EXPLORER_SIZE,
  LAYOUT_MIN_WIDTH,
  LAYOUT_STORAGE_KEY,
  SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_SIZE,
  WORKSPACE_STORAGE_KEY,
} from '@/layout/constants';

export const SHELL_MIN_WIDTH = LAYOUT_MIN_WIDTH;

export {
  AI_PANEL_SIZE,
  BOTTOM_PANEL_SIZE,
  EXPLORER_SIZE,
  LAYOUT_STORAGE_KEY,
  SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_SIZE,
  WORKSPACE_STORAGE_KEY,
};

export const SIDEBAR_STORAGE_KEY = 'launchos.shell.sidebar';

export { SIDEBAR_ICONS, SIDEBAR_NAV_ITEMS } from '@/features/sidebar/constants';

export { BOTTOM_PANEL_TABS } from '@/features/bottom-panel/constants';

export const AI_PANEL_TABS: readonly { id: AiPanelTabId; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'agent', label: 'Agent' },
  { id: 'memory', label: 'Memory' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'context', label: 'Context' },
] as const;
