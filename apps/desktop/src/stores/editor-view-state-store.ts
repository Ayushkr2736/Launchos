import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const EDITOR_VIEW_STATE_STORAGE_KEY = 'launchos.editor.view-state';

/** Serializable Monaco editor view state (cursor + scroll + selections). */
export type EditorViewStateSnapshot = Record<string, unknown>;

export interface EditorViewStateStore {
  /** View state keyed by document / tab id. */
  byId: Record<string, EditorViewStateSnapshot>;
  setViewState: (id: string, state: EditorViewStateSnapshot | null) => void;
  getViewState: (id: string) => EditorViewStateSnapshot | null;
  clearViewState: (id: string) => void;
  remapId: (from: string, to: string) => void;
}

export const useEditorViewStateStore = create<EditorViewStateStore>()(
  persist(
    (set, get) => ({
      byId: {},
      setViewState: (id, state) => {
        if (!state) {
          const next = { ...get().byId };
          delete next[id];
          set({ byId: next });
          return;
        }
        set({ byId: { ...get().byId, [id]: state } });
      },
      getViewState: (id) => get().byId[id] ?? null,
      clearViewState: (id) => {
        const next = { ...get().byId };
        delete next[id];
        set({ byId: next });
      },
      remapId: (from, to) => {
        const state = get().byId[from];
        if (!state) {
          return;
        }
        const next = { ...get().byId };
        delete next[from];
        next[to] = state;
        set({ byId: next });
      },
    }),
    {
      name: EDITOR_VIEW_STATE_STORAGE_KEY,
      partialize: (state) => ({ byId: state.byId }),
    },
  ),
);
