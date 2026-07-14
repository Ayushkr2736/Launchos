import type { EditorThemeMode } from '@/features/editor/types';

import { resolveEditorThemeMode, resolveMonacoTheme } from '@/features/editor/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Resolves the Monaco theme from an explicit mode or the LaunchOS theme engine.
 */
export function useEditorTheme(mode: EditorThemeMode = 'system'): string {
  const { resolved } = useTheme();
  const effective = resolveEditorThemeMode(mode, resolved);
  return resolveMonacoTheme(effective);
}
