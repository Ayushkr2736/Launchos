import type { LayoutBreakpoint, PanelSizeConstraints } from '@/layout/types';

export const LAYOUT_STORAGE_KEY = 'launchos.shell.layout';
export const WORKSPACE_STORAGE_KEY = 'launchos.shell.workspace';

export const LAYOUT_MIN_WIDTH = 1280;

export const SIDEBAR_SIZE: PanelSizeConstraints = {
  min: 56,
  max: 360,
  default: 64,
  collapsed: 56,
};

export const SIDEBAR_EXPANDED_WIDTH = 288;

export const EXPLORER_SIZE: PanelSizeConstraints = {
  min: 180,
  max: 480,
  default: 260,
  collapsed: 0,
};

export const AI_PANEL_SIZE: PanelSizeConstraints = {
  min: 280,
  max: 640,
  default: 360,
  collapsed: 0,
};

export const BOTTOM_PANEL_SIZE: PanelSizeConstraints = {
  min: 120,
  max: 560,
  default: 220,
  collapsed: 36,
};

export const WORKSPACE_MIN_PERCENT = 30;

export const LAYOUT_BREAKPOINTS = {
  laptop: 1280,
  desktop: 1440,
  wide: 1920,
  ultra: 2560,
} as const satisfies Record<LayoutBreakpoint, number>;

export const LAYOUT_ANIMATION = {
  panelMs: 200,
  fadeMs: 160,
} as const;

export const LAYOUT_KEYBOARD = {
  toggleSidebar: ['meta+b', 'ctrl+b'],
  toggleBottomPanel: ['meta+j', 'ctrl+j'],
  toggleAiPanel: ['meta+shift+a', 'ctrl+shift+a'],
  toggleExplorer: ['meta+shift+e', 'ctrl+shift+e'],
  commandPalette: ['meta+k', 'ctrl+k'],
} as const;
