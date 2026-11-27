import { cn } from 'cn';
import * as React from 'react';

import { formatPayload } from '../../lib/format-payload';
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
 * Data the app defines, shown as JSON under a name derived from the part.
 *
 * The SDK lets an app attach its own data parts to a message; this is the
 * fallback presentation for them. The name and the payload live in the code
 * block chrome, and the payload scrolls inside a bounded height so a large
 * object never widens or lengthens the message. An app that has a presentation
 * of its own passes `render` and gets the whole part back, with no wrapper and
 * no default around it.
 *
 * The payload goes through `formatPayload`, so a value JSON cannot describe is
 * summarised rather than fatal — the same formatter a tool's input and output
 * use.
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
  const payload = formatPayload(part.data) ?? text.unreadable;

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
        <CodeBlockContent className="max-h-80">{payload}</CodeBlockContent>
      </CodeBlock>
    </div>
  );
}

export { DataPart };
