import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';

import type { EditorContextValue } from '@/modules/editor/types';

import { configureMonaco } from '@/modules/editor/services/monaco-setup';
import { useEditorStore } from '@/modules/editor/stores/editor-store';

const EditorContext = createContext<EditorContextValue | null>(null);

interface EditorProviderProps {
  children: ReactNode;
}

/**
 * Boots Monaco workers and exposes editor preferences + imperative commands
 * to the tree via `useEditor()`.
 */
export function EditorProvider({ children }: EditorProviderProps) {
  useEffect(() => {
    configureMonaco();
  }, []);

  const fontSize = useEditorStore((s) => s.fontSize);
  const wordWrap = useEditorStore((s) => s.wordWrap);
  const minimapEnabled = useEditorStore((s) => s.minimapEnabled);
  const stickyScrollEnabled = useEditorStore((s) => s.stickyScrollEnabled);
  const foldEnabled = useEditorStore((s) => s.foldEnabled);
  const bracketPairColorization = useEditorStore((s) => s.bracketPairColorization);
  const themeMode = useEditorStore((s) => s.themeMode);
  const activeEditorId = useEditorStore((s) => s.activeEditorId);
  const setFontSize = useEditorStore((s) => s.setFontSize);
  const setWordWrap = useEditorStore((s) => s.setWordWrap);
  const setMinimapEnabled = useEditorStore((s) => s.setMinimapEnabled);
  const setStickyScrollEnabled = useEditorStore((s) => s.setStickyScrollEnabled);
  const setThemeMode = useEditorStore((s) => s.setThemeMode);
  const registerEditor = useEditorStore((s) => s.registerEditor);
  const getActiveEditor = useEditorStore((s) => s.getActiveEditor);
  const setActiveEditorId = useEditorStore((s) => s.setActiveEditorId);
  const find = useEditorStore((s) => s.find);
  const replace = useEditorStore((s) => s.replace);
  const goToLine = useEditorStore((s) => s.goToLine);
  const fontZoomIn = useEditorStore((s) => s.fontZoomIn);
  const fontZoomOut = useEditorStore((s) => s.fontZoomOut);
  const fontZoomReset = useEditorStore((s) => s.fontZoomReset);

  const value = useMemo<EditorContextValue>(
    () => ({
      preferences: {
        fontSize,
        wordWrap,
        minimapEnabled,
        stickyScrollEnabled,
        foldEnabled,
        bracketPairColorization,
        themeMode,
      },
      setFontSize,
      setWordWrap,
      setMinimapEnabled,
      setStickyScrollEnabled,
      setThemeMode,
      registerEditor,
      getActiveEditor,
      setActiveEditorId,
      activeEditorId,
      find,
      replace,
      goToLine,
      fontZoomIn,
      fontZoomOut,
      fontZoomReset,
    }),
    [
      activeEditorId,
      bracketPairColorization,
      find,
      foldEnabled,
      fontSize,
      fontZoomIn,
      fontZoomOut,
      fontZoomReset,
      getActiveEditor,
      goToLine,
      minimapEnabled,
      registerEditor,
      replace,
      setActiveEditorId,
      setFontSize,
      setMinimapEnabled,
      setStickyScrollEnabled,
      setThemeMode,
      setWordWrap,
      stickyScrollEnabled,
      themeMode,
      wordWrap,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

// Context hooks are intentionally co-located with the provider.
/* eslint-disable react-refresh/only-export-components -- useEditorContext hooks */
export function useEditorContext(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error('useEditor() must be used within <EditorProvider>.');
  }
  return ctx;
}

export function useOptionalEditorContext(): EditorContextValue | null {
  return useContext(EditorContext);
}
/* eslint-enable react-refresh/only-export-components */
