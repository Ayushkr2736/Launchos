import type { EditorThemeMode } from '@/features/editor/types';
import type { ResolvedTheme } from '@/theme/types';

import { MONACO_THEME_DARK, MONACO_THEME_LIGHT } from '@/features/editor/constants';

/** Map LaunchOS resolved theme → Monaco built-in theme id. */
export function resolveMonacoTheme(resolved: ResolvedTheme): string {
  return resolved === 'dark' ? MONACO_THEME_DARK : MONACO_THEME_LIGHT;
}

export function resolveEditorThemeMode(
  mode: EditorThemeMode,
  systemResolved: ResolvedTheme,
): ResolvedTheme {
  if (mode === 'system') {
    return systemResolved;
  }
  return mode;
}
