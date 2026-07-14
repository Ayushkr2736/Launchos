import { Editor as MonacoReactEditor } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';

import type { EditorLanguage } from '@/features/editor/types';
import type { EditorRevealTarget } from '@/stores/editor-reveal-store';
import type { EditorViewStateSnapshot } from '@/stores/editor-view-state-store';
import type { OnMount } from '@monaco-editor/react';
import type { editor as MonacoEditorNS, IDisposable } from 'monaco-editor';

import { EDITOR_DEFAULT_OPTIONS } from '@/features/editor/constants';
import { configureMonaco } from '@/features/editor/monaco-setup';

interface MonacoEditorViewProps {
  value: string;
  language: EditorLanguage;
  theme: string;
  path?: string;
  readOnly?: boolean;
  initialViewState?: EditorViewStateSnapshot | null;
  revealTarget?: EditorRevealTarget | null;
  onChange?: (value: string) => void;
  onReady?: () => void;
  onViewStateChange?: (state: EditorViewStateSnapshot | null) => void;
}

/**
 * Thin Monaco wrapper. Owns layout/options only — no document/domain logic.
 */
export function MonacoEditorView({
  value,
  language,
  theme,
  path,
  readOnly = false,
  initialViewState = null,
  revealTarget = null,
  onChange,
  onReady,
  onViewStateChange,
}: MonacoEditorViewProps) {
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  const disposablesRef = useRef<IDisposable[]>([]);
  const viewStateRef = useRef(initialViewState);
  const revealRef = useRef(revealTarget);
  const onViewStateChangeRef = useRef(onViewStateChange);

  useEffect(() => {
    viewStateRef.current = initialViewState;
  }, [initialViewState]);

  useEffect(() => {
    revealRef.current = revealTarget;
  }, [revealTarget]);

  useEffect(() => {
    onViewStateChangeRef.current = onViewStateChange;
  }, [onViewStateChange]);

  useEffect(() => {
    configureMonaco();
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !revealTarget) {
      return;
    }
    editor.revealLineInCenter(revealTarget.lineNumber);
    editor.setPosition({
      lineNumber: revealTarget.lineNumber,
      column: revealTarget.column,
    });
    editor.focus();
  }, [revealTarget]);

  useEffect(() => {
    return () => {
      const editor = editorRef.current;
      if (editor && !editor.getModel()?.isDisposed()) {
        const state = editor.saveViewState();
        if (state) {
          onViewStateChangeRef.current?.(state as unknown as EditorViewStateSnapshot);
        }
      }
      for (const disposable of disposablesRef.current) {
        disposable.dispose();
      }
      disposablesRef.current = [];
      editorRef.current = null;
    };
  }, []);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    const reveal = revealRef.current;
    if (reveal) {
      editor.revealLineInCenter(reveal.lineNumber);
      editor.setPosition({ lineNumber: reveal.lineNumber, column: reveal.column });
      editor.focus();
    } else {
      const restore = viewStateRef.current;
      if (restore) {
        try {
          editor.restoreViewState(restore as unknown as MonacoEditorNS.ICodeEditorViewState);
        } catch {
          // Ignore corrupt persisted view state.
        }
      }
    }

    const emitViewState = () => {
      const state = editor.saveViewState();
      onViewStateChangeRef.current?.(state ? (state as unknown as EditorViewStateSnapshot) : null);
    };

    disposablesRef.current = [
      editor.onDidChangeCursorPosition(emitViewState),
      editor.onDidScrollChange(emitViewState),
    ];

    onReady?.();
  };

  return (
    <MonacoReactEditor
      height="100%"
      width="100%"
      theme={theme}
      language={language}
      value={value}
      {...(path !== undefined ? { path } : {})}
      loading={null}
      options={{
        ...EDITOR_DEFAULT_OPTIONS,
        readOnly,
        domReadOnly: readOnly,
      }}
      onChange={(next) => {
        onChange?.(next ?? '');
      }}
      onMount={handleMount}
      className="launchos-monaco h-full min-h-0 w-full"
    />
  );
}
