export type EditorLanguage =
  'typescript' | 'javascript' | 'json' | 'markdown' | 'html' | 'css' | 'python' | 'plaintext';

export type EditorThemeMode = 'light' | 'dark' | 'system';

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
