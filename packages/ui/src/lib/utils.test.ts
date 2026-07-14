import { describe, expect, it } from 'vitest';

import { cn } from './utils.js';

describe('cn', () => {
  it('merges class names and resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4', 'text-sm')).toBe('px-4 text-sm');
  });
});
