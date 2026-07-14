import { Editor as MonacoReactEditor } from '@monaco-editor/react';
import { useEffect, useMemo, useRef } from 'react';

import type {
  EditorLanguage,
  EditorRevealTarget,
  EditorViewStateSnapshot,
} from '@/modules/editor/types';
import type { OnMount } from '@monaco-editor/react';
import type { editor as MonacoEditorNS, IDisposable } from 'monaco-editor';

import { useOptionalEditorContext } from '@/modules/editor/components/EditorProvider';
import { buildEditorOptions } from '@/modules/editor/constants';
import { createEditorCommandApi } from '@/modules/editor/services/editor-commands';
import { toMonacoLanguageId } from '@/modules/editor/services/language-service';
import { configureLanguageDefaults, configureMonaco } from '@/modules/editor/services/monaco-setup';
import { useEditorStore } from '@/modules/editor/stores/editor-store';

export interface MonacoEditorProps {
  id: string;
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
 * Thin Monaco surface. Registers with EditorStore for Find / Replace / Go to Line / Zoom.
 */
export function MonacoEditor({
  id,
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
}: MonacoEditorProps) {
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  const disposablesRef = useRef<IDisposable[]>([]);
  const viewStateRef = useRef(initialViewState);
  const revealRef = useRef(revealTarget);
  const onViewStateChangeRef = useRef(onViewStateChange);

  const ctx = useOptionalEditorContext();
  const fontSize = useEditorStore((s) => s.fontSize);
  const wordWrap = useEditorStore((s) => s.wordWrap);
  const minimapEnabled = useEditorStore((s) => s.minimapEnabled);
  const stickyScrollEnabled = useEditorStore((s) => s.stickyScrollEnabled);
  const foldEnabled = useEditorStore((s) => s.foldEnabled);
  const bracketPairColorization = useEditorStore((s) => s.bracketPairColorization);
  const registerEditor = useEditorStore((s) => s.registerEditor);
  const setActiveEditorId = useEditorStore((s) => s.setActiveEditorId);

  const prefs = ctx?.preferences ?? {
    fontSize,
    wordWrap,
    minimapEnabled,
    stickyScrollEnabled,
    foldEnabled,
    bracketPairColorization,
  };

  const options = useMemo(
    () =>
      buildEditorOptions({
        fontSize: prefs.fontSize,
        wordWrap: prefs.wordWrap,
        minimapEnabled: prefs.minimapEnabled,
        stickyScrollEnabled: prefs.stickyScrollEnabled,
        foldEnabled: prefs.foldEnabled,
        bracketPairColorization: prefs.bracketPairColorization,
        readOnly,
      }),
    [
      prefs.fontSize,
      prefs.wordWrap,
      prefs.minimapEnabled,
      prefs.stickyScrollEnabled,
      prefs.foldEnabled,
      prefs.bracketPairColorization,
      readOnly,
    ],
  );

  const monacoLanguage = toMonacoLanguageId(language);

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

  // Push preference changes into the live editor without remounting.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    editor.updateOptions(options);
  }, [options]);

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

  const handleMount: OnMount = (editor, monacoApi) => {
    editorRef.current = editor;
    configureLanguageDefaults(monacoApi);

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

    const api = createEditorCommandApi(editor);
    const unregister = (ctx?.registerEditor ?? registerEditor)(id, api);

    disposablesRef.current = [
      editor.onDidChangeCursorPosition(emitViewState),
      editor.onDidScrollChange(emitViewState),
      editor.onDidFocusEditorText(() => {
        (ctx?.setActiveEditorId ?? setActiveEditorId)(id);
      }),
      { dispose: unregister },
    ];

    onReady?.();
  };

  return (
    <MonacoReactEditor
      height="100%"
      width="100%"
      theme={theme}
      language={monacoLanguage}
      value={value}
      {...(path !== undefined ? { path } : {})}
      loading={null}
      options={options}
      onChange={(next) => {
        onChange?.(next ?? '');
      }}
      onMount={handleMount}
      className="launchos-monaco h-full min-h-0 w-full"
    />
  );
}
