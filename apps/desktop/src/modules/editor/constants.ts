import type { EditorLanguage, EditorPreferences, EditorWordWrap } from '@/modules/editor/types';
import type { editor } from 'monaco-editor';

export const EDITOR_AUTOSAVE_DELAY_MS = 800;

export const EDITOR_FONT_SIZE_MIN = 10;
export const EDITOR_FONT_SIZE_MAX = 28;
export const EDITOR_FONT_SIZE_DEFAULT = 13;

export const EDITOR_STORAGE_KEY = 'launchos.editor.preferences';

export const EDITOR_SUPPORTED_LANGUAGES: readonly EditorLanguage[] = [
  'typescript',
  'javascript',
  'tsx',
  'jsx',
  'json',
  'html',
  'css',
  'scss',
  'markdown',
  'python',
  'rust',
  'go',
  'plaintext',
] as const;

export const MONACO_THEME_LIGHT = 'vs';
export const MONACO_THEME_DARK = 'vs-dark';

export const EDITOR_DEFAULT_PREFERENCES: EditorPreferences = {
  fontSize: EDITOR_FONT_SIZE_DEFAULT,
  wordWrap: 'on',
  minimapEnabled: true,
  stickyScrollEnabled: true,
  foldEnabled: true,
  bracketPairColorization: true,
  themeMode: 'system',
};

/** Base Monaco options — feature flags applied per instance via preferences. */
export const EDITOR_BASE_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  fontLigatures: true,
  lineHeight: 20,
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  renderLineHighlight: 'line',
  tabSize: 2,
  detectIndentation: true,
  autoIndent: 'full',
  formatOnPaste: true,
  formatOnType: false,
  multiCursorModifier: 'alt',
  multiCursorMergeOverlapping: true,
  links: true,
  colorDecorators: true,
  renderWhitespace: 'selection',
  padding: { top: 8, bottom: 8 },
  scrollbar: {
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
    useShadows: false,
  },
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: 'never',
    seedSearchStringFromSelection: 'always',
  },
  gotoLocation: {
    multiple: 'goto',
    multipleDefinitions: 'goto',
    multipleDeclarations: 'goto',
    multipleImplementations: 'goto',
    multipleReferences: 'goto',
    multipleTypeDefinitions: 'goto',
  },
  // Enabled by default; toggled from preferences at runtime.
  folding: true,
  foldingHighlight: true,
  foldingStrategy: 'auto',
  showFoldingControls: 'mouseover',
  bracketPairColorization: { enabled: true },
  matchBrackets: 'always',
  stickyScroll: { enabled: true, maxLineCount: 5 },
  minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
  wordWrap: 'on',
  unicodeHighlight: {
    ambiguousCharacters: false,
  },
};

export function buildEditorOptions(input: {
  fontSize: number;
  wordWrap: EditorWordWrap;
  minimapEnabled: boolean;
  stickyScrollEnabled: boolean;
  foldEnabled: boolean;
  bracketPairColorization: boolean;
  readOnly: boolean;
}): editor.IStandaloneEditorConstructionOptions {
  return {
    ...EDITOR_BASE_OPTIONS,
    fontSize: input.fontSize,
    wordWrap: input.wordWrap,
    folding: input.foldEnabled,
    bracketPairColorization: { enabled: input.bracketPairColorization },
    stickyScroll: { enabled: input.stickyScrollEnabled, maxLineCount: 5 },
    minimap: {
      enabled: input.minimapEnabled,
      scale: 1,
      showSlider: 'mouseover',
    },
    readOnly: input.readOnly,
    domReadOnly: input.readOnly,
  };
}
