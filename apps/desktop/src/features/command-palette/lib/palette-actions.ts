import { useLayoutStore } from '@/stores/layout-store';

export function closeCommandPalette(): void {
  useLayoutStore.getState().setCommandPaletteOpen(false);
}

export function openCommandPalette(): void {
  useLayoutStore.getState().setCommandPaletteOpen(true);
}

/** Run an action and close the palette. */
export function runAndClose(action: () => void): () => void {
  return () => {
    action();
    closeCommandPalette();
  };
}
