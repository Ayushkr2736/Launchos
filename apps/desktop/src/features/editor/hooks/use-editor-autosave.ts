import { useEffect, useRef } from 'react';

import type { EditorSavePayload } from '@/features/editor/types';

import { EDITOR_AUTOSAVE_DELAY_MS } from '@/features/editor/constants';

interface UseEditorAutosaveOptions {
  id: string;
  value: string;
  path?: string;
  enabled?: boolean;
  delayMs?: number;
  onSave?: (payload: EditorSavePayload) => void;
}

/**
 * UI-only autosave hook: debounces value changes and invokes `onSave`.
 * Does not persist to disk or call a backend.
 */
export function useEditorAutosave({
  id,
  value,
  path,
  enabled = true,
  delayMs = EDITOR_AUTOSAVE_DELAY_MS,
  onSave,
}: UseEditorAutosaveOptions): void {
  const onSaveRef = useRef(onSave);
  const skipFirst = useRef(true);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!enabled || !onSaveRef.current) {
      return;
    }
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      onSaveRef.current?.({ id, value, ...(path !== undefined ? { path } : {}) });
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [delayMs, enabled, id, path, value]);

  useEffect(() => {
    skipFirst.current = true;
  }, [id]);
}
