import { cn } from 'cn';
import * as React from 'react';

import { CodeBlock, CodeBlockContent, CodeBlockHeader, CodeBlockTitle } from '../ui/code-block';

import type { DataUIPart } from 'ai';

/** The SDK's app-defined data part, as `useChat` hands it over. */
export type DataPartData<TData = unknown> = DataUIPart<Record<string, TData>>;

/** Every user-facing string, so the part can be translated without a fork. */
export type DataPartLabels = {
  /** The name a part falls back to when its type names nothing. */
  data: string;
  /** The sentence shown in place of JSON when the payload cannot be read. */
  unreadable: string;
};

const DEFAULT_LABELS: DataPartLabels = {
  data: 'Data',
  unreadable: 'This data cannot be shown',
};

// `part` is also a DOM attribute, so it has to leave the forwarded props or the
// element's `part?: string` would be intersected into the data part.
export type DataPartProps<TData = unknown> = Omit<
  React.ComponentProps<'div'>,
  'children' | 'part'
> & {
  part: DataPartData<TData>;
  /**
   * Draw the part yourself. It replaces the whole default rendering — name,
   * frame and payload — so an app owns the presentation of its own data.
   */
  render?: (part: DataPartData<TData>) => React.ReactNode;
  /** Override the strings shown, one at a time. */
  labels?: Partial<DataPartLabels>;
};

/**
 * `data-lastSearchResults` reads as "Last search results": the SDK's prefix is
 * dropped, camelCase and separators become word breaks, and the first word is
 * capitalised. A part type that names nothing returns an empty string.
 */
function humaniseNameOf(type: string): string {
  const words = type
    .replace(/^data-/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return words ? words[0].toUpperCase() + words.slice(1) : '';
}

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
 * The payload as JSON, or a sentence when even that is not possible — a
 * `toJSON` that throws, say. A message never fails to render because one part
 * carried something JSON cannot describe.
 */
function payloadTextOf(data: unknown, labels: DataPartLabels): string {
  const ancestors: unknown[] = [];

  try {
    const json = JSON.stringify(
      data,
      // A plain function, not an arrow: the replacer's `this` is the object
      // holding the value, which is how the cycle check walks the parent chain.
      function (this: unknown, key: string, value: unknown) {
        return readableValue.call(this, key, value, ancestors);
      },
      2,
    );

    if (json !== undefined) return json;
  } catch {
    return labels.unreadable;
  }

  // JSON.stringify only answers `undefined` for a payload that is itself
  // `undefined`, which still reads as a word rather than a blank frame.
  return String(data);
}

/**
 * Data the app defines, shown as JSON under a name derived from the part.
 *
 * The SDK lets an app attach its own data parts to a message; this is the
 * fallback presentation for them. The name and the payload live in the code
 * block chrome, and the payload scrolls inside a bounded height so a large
 * object never widens or lengthens the message. An app that has a presentation
 * of its own passes `render` and gets the whole part back, with no wrapper and
 * no default around it.
 */
function DataPart<TData = unknown>({
  part,
  render,
  labels,
  className,
  ...props
}: DataPartProps<TData>) {
  // A render prop owns the part completely, so there is nothing to wrap and
  // nothing of the default rendering left to collide with it.
  if (render) return <>{render(part)}</>;

  const text = { ...DEFAULT_LABELS, ...labels };
  const name = humaniseNameOf(part.type) || text.data;

  return (
    <div
      data-slot="data-part"
      data-part-type={part.type}
      className={cn('flex min-w-0 flex-col', className)}
      {...props}
    >
      <CodeBlock size="sm">
        <CodeBlockHeader>
          <CodeBlockTitle>{name}</CodeBlockTitle>
        </CodeBlockHeader>
        {/*
          The code block already scrolls; the height cap is what keeps a long
          payload inside the message instead of pushing the transcript down.
        */}
        <CodeBlockContent className="max-h-80">{payloadTextOf(part.data, text)}</CodeBlockContent>
      </CodeBlock>
    </div>
  );
}

export { DataPart };
