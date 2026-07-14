import type { EditorThemeMode } from '@/modules/editor/types';

import { MONACO_THEME_DARK, MONACO_THEME_LIGHT } from '@/modules/editor/constants';

export type ResolvedEditorTheme = 'light' | 'dark';

/** Map LaunchOS resolved theme → Monaco built-in theme id. */
export function resolveMonacoTheme(resolved: ResolvedEditorTheme): string {
  return resolved === 'dark' ? MONACO_THEME_DARK : MONACO_THEME_LIGHT;
}

export function resolveEditorThemeMode(
  mode: EditorThemeMode,
  systemResolved: ResolvedEditorTheme,
): ResolvedEditorTheme {
  if (mode === 'system') {
    return systemResolved;
  }
  return mode;
}
