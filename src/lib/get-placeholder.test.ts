import { describe, expect, it } from 'vitest';

import { getPlaceholder } from './get-placeholder';

describe('getPlaceholder', () => {
  it('marks an optional field as optional', () => {
    expect(getPlaceholder('you@example.com')).toBe('you@example.com (optional)');
  });

  it('leaves a required field alone', () => {
    expect(getPlaceholder('you@example.com', true)).toBe('you@example.com');
  });

  it('handles a missing placeholder', () => {
    expect(getPlaceholder(undefined)).toBeUndefined();
    expect(getPlaceholder('')).toBe('');
  });
});
