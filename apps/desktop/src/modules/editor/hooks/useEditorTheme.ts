import { useMemo } from 'react';

import type { EditorThemeMode } from '@/modules/editor/types';

import { useTheme } from '@/hooks/use-theme';
import { useOptionalEditorContext } from '@/modules/editor/components/EditorProvider';
import {
  resolveEditorThemeMode,
  resolveMonacoTheme,
} from '@/modules/editor/services/theme-service';
import { useEditorStore } from '@/modules/editor/stores/editor-store';

/**
 * Resolve the Monaco theme id from an explicit mode or the EditorStore /
 * LaunchOS system theme.
 */
export function useEditorTheme(themeModeProp?: EditorThemeMode): string {
  const { resolved } = useTheme();
  const storeMode = useEditorStore((s) => s.themeMode);
  const ctx = useOptionalEditorContext();
  const mode = themeModeProp ?? ctx?.preferences.themeMode ?? storeMode;

  return useMemo(() => {
    const resolvedMode = resolveEditorThemeMode(mode, resolved);
    return resolveMonacoTheme(resolvedMode);
  }, [mode, resolved]);
}
