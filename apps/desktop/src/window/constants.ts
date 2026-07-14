import type { WindowResizeEdge } from '@/window/types';

export const WINDOW_STORAGE_KEY = 'launchos.window.state';

export const WINDOW_MIN_WIDTH = 1280;
export const WINDOW_MIN_HEIGHT = 720;

export const WINDOW_DEFAULT_WIDTH = 1440;
export const WINDOW_DEFAULT_HEIGHT = 900;

export const WINDOW_RESIZE_EDGES: readonly WindowResizeEdge[] = [
  'North',
  'South',
  'East',
  'West',
  'NorthEast',
  'NorthWest',
  'SouthEast',
  'SouthWest',
] as const;

export const WINDOW_KEYBOARD = {
  minimize: ['meta+m', 'ctrl+m'],
  toggleMaximize: ['meta+shift+m', 'ctrl+shift+m'],
  close: ['meta+shift+w', 'ctrl+shift+w'],
} as const;
