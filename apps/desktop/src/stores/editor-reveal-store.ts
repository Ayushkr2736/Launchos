import { create } from 'zustand';

export interface EditorRevealTarget {
  readonly path: string;
  readonly lineNumber: number;
  readonly column: number;
}

interface EditorRevealStore {
  pending: EditorRevealTarget | null;
  setReveal: (target: EditorRevealTarget) => void;
  consumeReveal: (path: string) => EditorRevealTarget | null;
  clear: () => void;
}

/** One-shot reveal request when opening a search (or similar) result. */
export const useEditorRevealStore = create<EditorRevealStore>((set, get) => ({
  pending: null,
  setReveal: (target) => {
    set({ pending: target });
  },
  consumeReveal: (path) => {
    const pending = get().pending;
    if (!pending || pending.path !== path) {
      return null;
    }
    set({ pending: null });
    return pending;
  },
  clear: () => {
    set({ pending: null });
  },
}));
