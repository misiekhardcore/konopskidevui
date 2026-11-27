import { describe, expect, it } from 'vitest';

import { formatPayload } from './format-payload';

describe('formatPayload', () => {
  it('formats a payload as indented JSON', () => {
    expect(formatPayload({ location: 'Kraków', temperatureC: 21 })).toBe(
      '{\n  "location": "Kraków",\n  "temperatureC": 21\n}',
    );
  });

  it('makes a BigInt a readable number', () => {
    expect(formatPayload({ revision: 12n })).toBe('{\n  "revision": "12"\n}');
  });

  it('names a function and keeps a symbol description', () => {
    expect(formatPayload({ onSave: function save() {}, tag: Symbol('clear') })).toBe(
      '{\n  "onSave": "[Function save]",\n  "tag": "Symbol(clear)"\n}',
    );
  });

  it('marks where a self-referencing payload closes', () => {
    const payload: Record<string, unknown> = { location: 'Kraków' };

    payload.self = payload;

    expect(formatPayload(payload)).toBe('{\n  "location": "Kraków",\n  "self": "[Circular]"\n}');
  });

  it('reports a payload it cannot read as nothing instead of throwing', () => {
    expect(
      formatPayload({
        toJSON() {
          throw new Error('nope');
        },
      }),
    ).toBeUndefined();
  });

  it('reads a payload that is not an object at all', () => {
    expect(formatPayload('clear')).toBe('"clear"');
    expect(formatPayload(undefined)).toBe('undefined');
  });
});
