import type { EditorContextValue } from '@/modules/editor/types';

import { useEditorContext } from '@/modules/editor/components/EditorProvider';
import { useEditorStore } from '@/modules/editor/stores/editor-store';

/**
 * Primary hook for editor preferences and imperative commands
 * (Find, Replace, Go to Line, Font Zoom).
 *
 * Must be used under `<EditorProvider>`. For store-only access outside React
 * trees, use `useEditorStore` / `EditorStore` directly.
 */
export function useEditor(): EditorContextValue {
  return useEditorContext();
}

/** Convenience: subscribe to a single preference without the full context. */
export function useEditorPreference<T extends keyof ReturnType<typeof useEditorStore.getState>>(
  key: T,
): ReturnType<typeof useEditorStore.getState>[T] {
  return useEditorStore((state) => state[key]);
}
