import { useEffect, useRef } from 'react';

import type { EditorSavePayload } from '@/modules/editor/types';

import { EDITOR_AUTOSAVE_DELAY_MS } from '@/modules/editor/constants';

interface UseEditorAutosaveOptions {
  id: string;
  value: string;
  path?: string;
  enabled?: boolean;
  delayMs?: number;
  onSave?: (payload: EditorSavePayload) => void;
}

/**
 * Debounces value changes and invokes `onSave`. Persistence is owned by the caller.
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
