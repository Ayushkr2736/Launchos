/**
 * @deprecated Import from `@/modules/editor` for new code.
 * This barrel re-exports the production Monaco module for workspace compatibility.
 */
export {
  Editor,
  EditorProvider,
  MonacoEditor,
  EditorEmptyState,
  EditorLoadingState,
  EditorBinaryState,
  useEditor,
  useEditorPreference,
  useEditorTheme,
  useEditorAutosave,
  EditorStore,
  useEditorStore,
  configureMonaco,
  configureLanguageDefaults,
  resolveEditorLanguage,
  toMonacoLanguageId,
  resolveMonacoTheme,
  resolveEditorThemeMode,
  createEditorCommandApi,
  contentLooksBinary,
  isBinaryFilePath,
  EDITOR_AUTOSAVE_DELAY_MS,
  EDITOR_DEFAULT_OPTIONS,
  EDITOR_BASE_OPTIONS,
  EDITOR_SUPPORTED_LANGUAGES,
  MONACO_THEME_DARK,
  MONACO_THEME_LIGHT,
  buildEditorOptions,
} from '@/modules/editor';

export type {
  EditorProps,
  MonacoEditorProps,
  EditorChangePayload,
  EditorCommandApi,
  EditorContextValue,
  EditorDocument,
  EditorLanguage,
  EditorPreferences,
  EditorRevealTarget,
  EditorSavePayload,
  EditorThemeMode,
  EditorViewStateSnapshot,
  EditorWordWrap,
  EditorStoreState,
} from '@/modules/editor';

/** Alias kept for older imports. */
export { MonacoEditor as MonacoEditorView } from '@/modules/editor';
