import type { EditorLanguage } from '@/features/editor/types';

const EXTENSION_LANGUAGE: Record<string, EditorLanguage> = {
  ts: 'typescript',
  tsx: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  json: 'json',
  md: 'markdown',
  mdx: 'markdown',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'css',
  less: 'css',
  py: 'python',
  pyw: 'python',
};

/**
 * Resolve Monaco language id from a file path or explicit override.
 * Pure helper — no I/O or domain logic.
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
  const base = path.split('/').pop() ?? path;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) {
    return 'plaintext';
  }
  const ext = base.slice(dot + 1).toLowerCase();
  return EXTENSION_LANGUAGE[ext] ?? 'plaintext';
}
