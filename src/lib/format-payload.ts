/**
 * JSON's replacer makes the values JSON cannot express readable rather than
 * fatal: a BigInt becomes its digits, a function is named, a symbol keeps its
 * description, and a reference back up the tree is marked where it closes. The
 * cycle is found by walking the ancestors back to the holder the replacer is
 * called on, which is the only parent chain JSON.stringify exposes.
 */
function readableValue(this: unknown, _key: string, value: unknown, ancestors: unknown[]) {
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
  if (typeof value === 'symbol') return value.toString();

  if (typeof value === 'object' && value !== null) {
    while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) ancestors.pop();

    if (ancestors.includes(value)) return '[Circular]';

    ancestors.push(value);
  }

  return value;
}

/**
 * A message payload as indented JSON, with the values JSON cannot describe made
 * readable instead of fatal (ADR 0014: an output is shown as data).
 *
 * `undefined` means the payload could not be read at all — a `toJSON` that
 * throws, say — so each caller decides what to say in its place. Callers that
 * show an AI part's data share this formatter, so a part never takes the
 * message down over a BigInt or a cycle.
 */
export function formatPayload(value: unknown): string | undefined {
  const ancestors: unknown[] = [];

  try {
    const json = JSON.stringify(
      value,
      // A plain function, not an arrow: the replacer's `this` is the object
      // holding the value, which is how the cycle check walks the parent chain.
      function (this: unknown, key: string, value: unknown) {
        return readableValue.call(this, key, value, ancestors);
      },
      2,
    );

    // JSON.stringify answers `undefined` only for a payload that is itself
    // `undefined`, which still reads as a word rather than a blank frame.
    return json ?? String(value);
  } catch {
    return undefined;
  }
}
