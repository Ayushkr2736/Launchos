import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  EditorCommandApi,
  EditorPreferences,
  EditorThemeMode,
  EditorWordWrap,
} from '@/modules/editor/types';

import {
  EDITOR_DEFAULT_PREFERENCES,
  EDITOR_FONT_SIZE_DEFAULT,
  EDITOR_FONT_SIZE_MAX,
  EDITOR_FONT_SIZE_MIN,
  EDITOR_STORAGE_KEY,
} from '@/modules/editor/constants';

function clampFontSize(size: number): number {
  return Math.min(EDITOR_FONT_SIZE_MAX, Math.max(EDITOR_FONT_SIZE_MIN, Math.round(size)));
}

export interface EditorStoreState extends EditorPreferences {
  activeEditorId: string | null;
  /** Live imperative APIs keyed by editor document id. */
  editors: Record<string, EditorCommandApi>;
  setFontSize: (size: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  setWordWrap: (wrap: EditorWordWrap) => void;
  setMinimapEnabled: (enabled: boolean) => void;
  setStickyScrollEnabled: (enabled: boolean) => void;
  setFoldEnabled: (enabled: boolean) => void;
  setBracketPairColorization: (enabled: boolean) => void;
  setThemeMode: (mode: EditorThemeMode) => void;
  setActiveEditorId: (id: string | null) => void;
  registerEditor: (id: string, api: EditorCommandApi) => () => void;
  getActiveEditor: () => EditorCommandApi | null;
  find: () => void;
  replace: () => void;
  goToLine: () => void;
  fontZoomIn: () => void;
  fontZoomOut: () => void;
  fontZoomReset: () => void;
  getPreferences: () => EditorPreferences;
}

export const useEditorStore = create<EditorStoreState>()(
  persist(
    (set, get) => ({
      ...EDITOR_DEFAULT_PREFERENCES,
      activeEditorId: null,
      editors: {},
      setFontSize: (size) => {
        set({ fontSize: clampFontSize(size) });
      },
      zoomIn: () => {
        set((state) => ({ fontSize: clampFontSize(state.fontSize + 1) }));
      },
      zoomOut: () => {
        set((state) => ({ fontSize: clampFontSize(state.fontSize - 1) }));
      },
      zoomReset: () => {
        set({ fontSize: EDITOR_FONT_SIZE_DEFAULT });
      },
      setWordWrap: (wordWrap) => {
        set({ wordWrap });
      },
      setMinimapEnabled: (minimapEnabled) => {
        set({ minimapEnabled });
      },
      setStickyScrollEnabled: (stickyScrollEnabled) => {
        set({ stickyScrollEnabled });
      },
      setFoldEnabled: (foldEnabled) => {
        set({ foldEnabled });
      },
      setBracketPairColorization: (bracketPairColorization) => {
        set({ bracketPairColorization });
      },
      setThemeMode: (themeMode) => {
        set({ themeMode });
      },
      setActiveEditorId: (activeEditorId) => {
        set({ activeEditorId });
      },
      registerEditor: (id, api) => {
        set((state) => ({
          editors: { ...state.editors, [id]: api },
          activeEditorId: state.activeEditorId ?? id,
        }));
        return () => {
          set((state) => {
            const next = { ...state.editors };
            delete next[id];
            return {
              editors: next,
              activeEditorId: state.activeEditorId === id ? null : state.activeEditorId,
            };
          });
        };
      },
      getActiveEditor: () => {
        const { activeEditorId, editors } = get();
        if (!activeEditorId) {
          return null;
        }
        return editors[activeEditorId] ?? null;
      },
      find: () => {
        get().getActiveEditor()?.find();
      },
      replace: () => {
        get().getActiveEditor()?.replace();
      },
      goToLine: () => {
        get().getActiveEditor()?.goToLine();
      },
      fontZoomIn: () => {
        const active = get().getActiveEditor();
        if (active) {
          active.fontZoomIn();
          return;
        }
        get().zoomIn();
      },
      fontZoomOut: () => {
        const active = get().getActiveEditor();
        if (active) {
          active.fontZoomOut();
          return;
        }
        get().zoomOut();
      },
      fontZoomReset: () => {
        const active = get().getActiveEditor();
        if (active) {
          active.fontZoomReset();
        }
        get().zoomReset();
      },
      getPreferences: () => {
        const state = get();
        return {
          fontSize: state.fontSize,
          wordWrap: state.wordWrap,
          minimapEnabled: state.minimapEnabled,
          stickyScrollEnabled: state.stickyScrollEnabled,
          foldEnabled: state.foldEnabled,
          bracketPairColorization: state.bracketPairColorization,
          themeMode: state.themeMode,
        };
      },
    }),
    {
      name: EDITOR_STORAGE_KEY,
      partialize: (state) => ({
        fontSize: state.fontSize,
        wordWrap: state.wordWrap,
        minimapEnabled: state.minimapEnabled,
        stickyScrollEnabled: state.stickyScrollEnabled,
        foldEnabled: state.foldEnabled,
        bracketPairColorization: state.bracketPairColorization,
        themeMode: state.themeMode,
      }),
    },
  ),
);

/** Alias matching the public API name from the module contract. */
export const EditorStore = useEditorStore;
