export { Editor } from '@/modules/editor/components/Editor';
export type { EditorProps } from '@/modules/editor/components/Editor';

export { EditorProvider } from '@/modules/editor/components/EditorProvider';
export { MonacoEditor } from '@/modules/editor/components/MonacoEditor';
export type { MonacoEditorProps } from '@/modules/editor/components/MonacoEditor';
export { EditorEmptyState } from '@/modules/editor/components/EditorEmptyState';
export { EditorLoadingState } from '@/modules/editor/components/EditorLoadingState';
export { EditorBinaryState } from '@/modules/editor/components/EditorBinaryState';

export { useEditor, useEditorPreference } from '@/modules/editor/hooks/useEditor';
export { useEditorTheme } from '@/modules/editor/hooks/useEditorTheme';
export { useEditorAutosave } from '@/modules/editor/hooks/useEditorAutosave';

export { EditorStore, useEditorStore } from '@/modules/editor/stores/editor-store';
export type { EditorStoreState } from '@/modules/editor/stores/editor-store';

export { configureMonaco, configureLanguageDefaults } from '@/modules/editor/services/monaco-setup';
export {
  resolveEditorLanguage,
  toMonacoLanguageId,
  isSupportedEditorLanguage,
} from '@/modules/editor/services/language-service';
export {
  resolveMonacoTheme,
  resolveEditorThemeMode,
} from '@/modules/editor/services/theme-service';
export { createEditorCommandApi } from '@/modules/editor/services/editor-commands';
export { contentLooksBinary, isBinaryFilePath } from '@/modules/editor/services/binary';

export {
  EDITOR_AUTOSAVE_DELAY_MS,
  EDITOR_BASE_OPTIONS,
  EDITOR_DEFAULT_PREFERENCES,
  EDITOR_FONT_SIZE_DEFAULT,
  EDITOR_FONT_SIZE_MAX,
  EDITOR_FONT_SIZE_MIN,
  EDITOR_STORAGE_KEY,
  EDITOR_SUPPORTED_LANGUAGES,
  MONACO_THEME_DARK,
  MONACO_THEME_LIGHT,
  buildEditorOptions,
} from '@/modules/editor/constants';

/** @deprecated Prefer EDITOR_BASE_OPTIONS / buildEditorOptions */
export { EDITOR_BASE_OPTIONS as EDITOR_DEFAULT_OPTIONS } from '@/modules/editor/constants';

export type {
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
} from '@/modules/editor/types';
