import type { WindowResizeEdge } from '@/window/types';
import type { Window } from '@tauri-apps/api/window';

import { WINDOW_MIN_HEIGHT, WINDOW_MIN_WIDTH } from '@/window/constants';

export function detectTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function getAppWindow(): Promise<Window> {
  const { getCurrentWindow } = await import('@tauri-apps/api/window');
  return getCurrentWindow();
}

export async function readNativeWindowSnapshot(): Promise<{
  isMaximized: boolean;
  isMinimized: boolean;
  isFocused: boolean;
  width: number;
  height: number;
  scaleFactor: number;
}> {
  const current = await getAppWindow();
  const [isMaximized, isMinimized, isFocused, outerSize, scaleFactor] = await Promise.all([
    current.isMaximized(),
    current.isMinimized(),
    current.isFocused(),
    current.outerSize(),
    current.scaleFactor(),
  ]);

  return {
    isMaximized,
    isMinimized,
    isFocused,
    width: Math.round(outerSize.width / scaleFactor),
    height: Math.round(outerSize.height / scaleFactor),
    scaleFactor,
  };
}

export async function ensureWindowConstraints(): Promise<void> {
  const current = await getAppWindow();
  const { LogicalSize } = await import('@tauri-apps/api/dpi');
  await current.setMinSize(new LogicalSize(WINDOW_MIN_WIDTH, WINDOW_MIN_HEIGHT));

  const factor = await current.scaleFactor();
  const outer = await current.outerSize();
  const width = Math.round(outer.width / factor);
  const height = Math.round(outer.height / factor);

  // Corrupt window-state restores can leave a 0×0 / tiny frame that looks like a black screen.
  if (width < WINDOW_MIN_WIDTH || height < WINDOW_MIN_HEIGHT) {
    await current.setSize(new LogicalSize(Math.max(width, 1440), Math.max(height, 900)));
    await current.center();
  }
}

export async function ensureWindowVisible(): Promise<void> {
  const current = await getAppWindow();
  await current.show();
  await current.setFocus();
}

export async function minimizeWindow(): Promise<void> {
  const current = await getAppWindow();
  await current.minimize();
}

export async function maximizeWindow(): Promise<void> {
  const current = await getAppWindow();
  await current.maximize();
}

export async function restoreWindow(): Promise<void> {
  const current = await getAppWindow();
  await current.unmaximize();
}

export async function toggleMaximizeWindow(): Promise<void> {
  const current = await getAppWindow();
  await current.toggleMaximize();
}

export async function closeWindow(): Promise<void> {
  const current = await getAppWindow();
  await current.close();
}

export async function startWindowDrag(): Promise<void> {
  const current = await getAppWindow();
  await current.startDragging();
}

export async function startWindowResize(direction: WindowResizeEdge): Promise<void> {
  const current = await getAppWindow();
  await current.startResizeDragging(direction);
}

export async function restorePersistedWindowState(): Promise<void> {
  const { restoreStateCurrent, StateFlags } = await import('@tauri-apps/plugin-window-state');
  await restoreStateCurrent(
    StateFlags.SIZE | StateFlags.POSITION | StateFlags.MAXIMIZED | StateFlags.FULLSCREEN,
  );
}

export async function savePersistedWindowState(): Promise<void> {
  const { saveWindowState, StateFlags } = await import('@tauri-apps/plugin-window-state');
  await saveWindowState(
    StateFlags.SIZE | StateFlags.POSITION | StateFlags.MAXIMIZED | StateFlags.FULLSCREEN,
  );
}
