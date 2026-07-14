import { useCallback, useEffect, type RefObject } from 'react';

import { KEYBOARD } from '@/constants/keyboard';
import { useSearchActions } from '@/features/search/hooks/use-search-actions';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { useSearchStore } from '@/stores/search-store';

const FOCUS_EVENT = 'launchos:focus-global-search';
const FOCUS_REPLACE_EVENT = 'launchos:focus-global-replace';

export function requestSearchInputFocus(): void {
  window.dispatchEvent(new Event(FOCUS_EVENT));
}

export function requestReplaceInputFocus(): void {
  window.dispatchEvent(new Event(FOCUS_REPLACE_EVENT));
}

export function useSearchInputFocusRegistration(
  inputRef: RefObject<HTMLInputElement | null>,
): void {
  useEffect(() => {
    const onFocus = () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener(FOCUS_EVENT, onFocus);
    return () => {
      window.removeEventListener(FOCUS_EVENT, onFocus);
    };
  }, [inputRef]);
}

export function useReplaceInputFocusRegistration(
  inputRef: RefObject<HTMLInputElement | null>,
): void {
  useEffect(() => {
    const onFocus = () => {
      useSearchStore.getState().setReplaceOpen(true);
      window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    };
    window.addEventListener(FOCUS_REPLACE_EVENT, onFocus);
    return () => {
      window.removeEventListener(FOCUS_REPLACE_EVENT, onFocus);
    };
  }, [inputRef]);
}

/** ⌘⇧F — open Search panel and focus the query field. */
export function useSearchShortcut(): void {
  const { openSearchPanel } = useSearchActions();

  const onSearch = useCallback(() => {
    openSearchPanel();
    window.setTimeout(() => {
      requestSearchInputFocus();
    }, 0);
  }, [openSearchPanel]);

  const onReplace = useCallback(() => {
    openSearchPanel();
    useSearchStore.getState().setReplaceOpen(true);
    window.setTimeout(() => {
      requestReplaceInputFocus();
    }, 0);
  }, [openSearchPanel]);

  useKeyboardShortcut(KEYBOARD.searchInFiles, onSearch, true, { allowInInputs: true });
  useKeyboardShortcut(KEYBOARD.replaceInFiles, onReplace, true, { allowInInputs: true });
}
