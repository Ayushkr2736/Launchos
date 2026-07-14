import type { EditorLanguage } from '@/features/editor/types';

export const EDITOR_AUTOSAVE_DELAY_MS = 800;

export const EDITOR_SUPPORTED_LANGUAGES: readonly EditorLanguage[] = [
  'typescript',
  'javascript',
  'json',
  'markdown',
  'html',
  'css',
  'python',
  'plaintext',
] as const;

export const MONACO_THEME_LIGHT = 'vs';
export const MONACO_THEME_DARK = 'vs-dark';

/** Default Monaco options shared by all LaunchOS editors. */
export const EDITOR_DEFAULT_OPTIONS = {
  automaticLayout: true,
  fontSize: 13,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  minimap: { enabled: true, scale: 1 },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: 'smooth' as const,
  cursorSmoothCaretAnimation: 'on' as const,
  renderLineHighlight: 'line' as const,
  tabSize: 2,
  wordWrap: 'on' as const,
  padding: { top: 8, bottom: 8 },
  bracketPairColorization: { enabled: true },
};
