import { describe, expect, it } from 'vitest';

import { err, isErr, isOk, ok } from './result.js';

describe('result', () => {
  it('creates ok results', () => {
    const result = ok(42);
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value).toBe(42);
    }
  });

  it('creates err results', () => {
    const result = err(new Error('failed'));
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toBe('failed');
    }
  });
});
