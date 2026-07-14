import type { EditorLanguage } from '@/modules/editor/types';

/** Extension → LaunchOS editor language. */
const EXTENSION_LANGUAGE: Record<string, EditorLanguage> = {
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'jsx',
  json: 'json',
  jsonc: 'json',
  md: 'markdown',
  mdx: 'markdown',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'scss',
  less: 'css',
  py: 'python',
  pyw: 'python',
  pyi: 'python',
  rs: 'rust',
  go: 'go',
};

/**
 * Map LaunchOS language ids to Monaco built-in language ids.
 * TSX/JSX reuse the TS/JS workers with JSX compiler options enabled.
 */
export function toMonacoLanguageId(language: EditorLanguage): string {
  switch (language) {
    case 'tsx':
      return 'typescript';
    case 'jsx':
      return 'javascript';
    default:
      return language;
  }
}

/**
 * Resolve LaunchOS language from path and/or explicit override.
 */
export function resolveEditorLanguage(
  path?: string | null,
  explicit?: EditorLanguage,
): EditorLanguage {
  if (explicit) {
    return explicit;
  }
  if (!path) {
    return 'plaintext';
  }
  const base = path.split(/[/\\]/).pop() ?? path;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) {
    return 'plaintext';
  }
  const ext = base.slice(dot + 1).toLowerCase();
  return EXTENSION_LANGUAGE[ext] ?? 'plaintext';
}

export function isSupportedEditorLanguage(value: string): value is EditorLanguage {
  return value in EXTENSION_LANGUAGE || value === 'plaintext';
}
