/**
 * LaunchOS Monaco Editor — public types.
 */

import type { editor as MonacoEditor } from 'monaco-editor';

export type EditorLanguage =
  | 'typescript'
  | 'javascript'
  | 'tsx'
  | 'jsx'
  | 'json'
  | 'html'
  | 'css'
  | 'scss'
  | 'markdown'
  | 'python'
  | 'rust'
  | 'go'
  | 'plaintext';

export type EditorThemeMode = 'light' | 'dark' | 'system';

export type EditorWordWrap = 'on' | 'off' | 'wordWrapColumn' | 'bounded';

/** Serializable Monaco view-state snapshot (cursor, scroll, folds). */
export type EditorViewStateSnapshot = Record<string, unknown>;

export interface EditorRevealTarget {
  readonly lineNumber: number;
  readonly column: number;
}

export interface EditorDocument {
  readonly id: string;
  readonly path?: string;
  readonly language: EditorLanguage;
  readonly value: string;
  readonly readOnly?: boolean;
}

export interface EditorChangePayload {
  readonly id: string;
  readonly value: string;
  readonly path?: string;
}

export interface EditorSavePayload {
  readonly id: string;
  readonly value: string;
  readonly path?: string;
}

export interface EditorPreferences {
  fontSize: number;
  wordWrap: EditorWordWrap;
  minimapEnabled: boolean;
  stickyScrollEnabled: boolean;
  foldEnabled: boolean;
  bracketPairColorization: boolean;
  themeMode: EditorThemeMode;
}

export interface EditorCommandApi {
  find: () => void;
  replace: () => void;
  goToLine: () => void;
  fontZoomIn: () => void;
  fontZoomOut: () => void;
  fontZoomReset: () => void;
  foldAll: () => void;
  unfoldAll: () => void;
  focus: () => void;
  revealLine: (lineNumber: number, column?: number) => void;
  getEditor: () => MonacoEditor.IStandaloneCodeEditor | null;
}

export interface EditorContextValue {
  preferences: EditorPreferences;
  setFontSize: (size: number) => void;
  setWordWrap: (wrap: EditorWordWrap) => void;
  setMinimapEnabled: (enabled: boolean) => void;
  setStickyScrollEnabled: (enabled: boolean) => void;
  setThemeMode: (mode: EditorThemeMode) => void;
  registerEditor: (id: string, api: EditorCommandApi) => () => void;
  getActiveEditor: () => EditorCommandApi | null;
  setActiveEditorId: (id: string | null) => void;
  activeEditorId: string | null;
  find: () => void;
  replace: () => void;
  goToLine: () => void;
  fontZoomIn: () => void;
  fontZoomOut: () => void;
  fontZoomReset: () => void;
}
