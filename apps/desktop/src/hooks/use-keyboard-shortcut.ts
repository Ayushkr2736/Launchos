import { useEffect } from 'react';

function normalizeCombo(combo: string): string {
  return combo.toLowerCase().replace(/\s+/g, '');
}

function resolveEventKey(event: KeyboardEvent): string {
  const key = event.key.toLowerCase();
  if (key.startsWith('arrow')) {
    return key.replace('arrow', '');
  }
  if (key === 'escape') {
    return 'esc';
  }
  return key;
}

function eventMatchesCombo(event: KeyboardEvent, combo: string): boolean {
  const parts = normalizeCombo(combo).split('+');
  const expected = parts[parts.length - 1];
  if (!expected) {
    return false;
  }

  const needsMeta = parts.includes('meta');
  const needsCtrl = parts.includes('ctrl');
  const needsShift = parts.includes('shift');
  const needsAlt = parts.includes('alt');

  const pressedKey = resolveEventKey(event);
  const codeMatch =
    event.code.toLowerCase() === `key${expected}` ||
    event.code.toLowerCase() === `digit${expected}` ||
    event.code.toLowerCase() === expected ||
    (expected === '`' && (event.code === 'Backquote' || pressedKey === '`'));

  if (pressedKey !== expected && !codeMatch) {
    return false;
  }

  return (
    event.metaKey === needsMeta &&
    event.ctrlKey === needsCtrl &&
    event.shiftKey === needsShift &&
    event.altKey === needsAlt
  );
}

export interface KeyboardShortcutOptions {
  allowInInputs?: boolean;
}

export function useKeyboardShortcut(
  combos: readonly string[],
  handler: (event: KeyboardEvent) => void,
  enabled = true,
  options: KeyboardShortcutOptions = {},
): void {
  const allowInInputs = options.allowInInputs ?? false;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        !allowInInputs &&
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      if (combos.some((combo) => eventMatchesCombo(event, combo))) {
        event.preventDefault();
        handler(event);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [allowInInputs, combos, enabled, handler]);
}
