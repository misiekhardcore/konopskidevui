'use client';

import { cn } from 'cn';
import * as React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { getCitations } from '../../lib/citations';
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from '../ui/code-block';
import { CitationMarker } from './citations';

import type { Citation, SourceInputPart } from '../../lib/citations';
import type { CitationRender, DocumentHref } from './citations';
import type { TextUIPart } from 'ai';
import type { Components } from 'react-markdown';

/** The SDK's text part, as `useChat` hands it over. */
export type ResponsePart = TextUIPart;

/** One marker the prose contains, resolved to the source it points at. */
export type CitationMatch = {
  /** Where the marker starts in the text node being scanned. */
  start: number;
  /** Where it ends; the half-open slice the citation replaces. */
  end: number;
  citation: Citation;
};

/**
 * How a provider's markers are found in a text node.
 *
 * The default understands `[n]`; a provider with its own syntax passes one of
 * these instead of forking the component.
 */
export type CitationResolver = (
  text: string,
  citations: readonly Citation[],
) => readonly CitationMatch[];

// `part` is also a DOM attribute, so it has to leave the forwarded props or the
// element's `part?: string` would be intersected into the text part.
export type ResponseProps = Omit<React.ComponentProps<'div'>, 'children' | 'part'> & {
  part: ResponsePart;
  /** The message's parts: the markers inside the prose resolve against its sources. */
  parts?: readonly SourceInputPart[];
  /** How to find the markers; the documented `[n]` syntax when omitted. */
  resolveCitation?: CitationResolver;
  /** Replace the marker's whole rendering; the same override the sources list takes. */
  renderMarker?: CitationRender;
  /** Where the app serves a document, so its markers become downloads. */
  documentHref?: DocumentHref;
};

/** The little of the markdown tree this module reads. */
type MarkdownNode = {
  type?: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: MarkdownNode[];
  data?: unknown;
  position?: {
    start: { offset?: number };
    end: { offset?: number };
  };
};

/** An inline fragment that may not hold blocks, so raw text can be appended to it. */
const INLINE_CONTAINERS = new Set([
  'paragraph',
  'heading',
  'tableCell',
  'emphasis',
  'strong',
  'link',
  'delete',
]);

/** A node's text, however deeply nested: a fence's code is a text node inside it. */
function textOf(node: MarkdownNode | undefined): string {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';

  return (node.children ?? []).map(textOf).join('');
}

/** The fence's language, from the `language-*` class the parser puts on the code. */
function languageOf(node: MarkdownNode | undefined): string | null {
  const className = node?.properties?.className;
  const names = Array.isArray(className)
    ? className.map(String)
    : typeof className === 'string'
      ? className.split(/\s+/)
      : [];

  for (const name of names) {
    const language = /^language-(.+)$/.exec(name)?.[1]?.trim();

    if (language) return language;
  }

  return null;
}

/**
 * True when the character at `index` is inside a code span on the line that
 * starts at `lineStart`. A matched backtick run opens and closes one; an
 * unmatched run is literal text and opens nothing.
 */
function insideCodeSpan(text: string, lineStart: number, index: number): boolean {
  let open = 0;

  for (let cursor = lineStart; cursor < index; cursor += 1) {
    if (text[cursor] !== '`') continue;

    let run = 0;

    while (text[cursor] === '`') {
      run += 1;
      cursor += 1;
    }

    if (open === 0) open = run;
    else if (open === run) open = 0;
  }

  return open !== 0;
}

/** True when `index` sits inside a fenced block that has not been closed yet. */
function insideFence(text: string, index: number): boolean {
  let fence: string | null = null;

  for (const line of text.slice(0, index).split('\n')) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];

    if (!marker) continue;

    if (!fence) fence = marker[0];
    else if (marker[0] === fence) fence = null;
  }

  return fence !== null;
}

/**
 * The trailing inline link the stream has not finished typing.
 *
 * Markdown closes an unclosed destination at the end of the input, so a provider
 * that is halfway through `[text](https://…` would flash a link to a URL it has
 * not finished producing — and GFM would autolink the bare URL inside it. An
 * image link is the same shape, and a candidate inside a fence or a code span is
 * left alone.
 */
const INCOMPLETE_LINK = /!?\[[^\]\n]*\]\([^)\n]*\s*$/;

type LiteralTail = { start: number; value: string };

/** The flag the literal tail carries, so the marker pass does not scan inside it. */
function isLiteral(node: MarkdownNode): boolean {
  return Boolean((node.data as { literal?: unknown } | undefined)?.literal);
}

function incompleteLinkOf(text: string): LiteralTail | null {
  const match = INCOMPLETE_LINK.exec(text);

  if (!match) return null;

  const bracket = match[0].indexOf('[') + match.index;

  if (insideFence(text, bracket)) return null;
  if (insideCodeSpan(text, text.lastIndexOf('\n', bracket) + 1, bracket)) return null;

  return { start: match.index, value: match[0] };
}

/** The documented marker syntax: one-based, in the citation list's own numbering. */
const resolveMarkers: CitationResolver = (text, citations) => {
  const byMarker = new Map(citations.map((citation) => [citation.marker, citation]));
  const matches: CitationMatch[] = [];

  for (const match of text.matchAll(/\[(\d+)\]/g)) {
    const citation = byMarker.get(Number(match[1]));

    if (citation) {
      matches.push({ start: match.index, end: match.index + match[0].length, citation });
    }
  }

  return matches;
};

/**
 * Turns each resolved marker into its own node, before the tree reaches React.
 *
 * Only a marker the resolver answers for is replaced: an unresolved marker, a
 * half-typed one and a malformed one stay the characters the model produced,
 * and the next render upgrades one whose source has arrived. A link's label and
 * a code block are never scanned, so a citation cannot nest inside a link and a
 * fence's example syntax stays example syntax.
 */
function remarkCitations({
  citations,
  resolve,
}: {
  citations: readonly Citation[];
  resolve: CitationResolver;
}) {
  const scan = (node: MarkdownNode) => {
    if (!node.children || node.type === 'link' || node.type === 'linkReference') return;

    const next: MarkdownNode[] = [];

    for (const child of node.children) {
      if (child.type !== 'text' || !child.value || isLiteral(child)) {
        scan(child);
        next.push(child);
        continue;
      }

      let cursor = 0;

      for (const match of resolve(child.value, citations)) {
        const { start, end, citation } = match;

        if (start < cursor || end <= start || end > child.value.length) continue;

        if (start > cursor) next.push({ type: 'text', value: child.value.slice(cursor, start) });

        next.push({
          type: 'citation',
          data: { hName: 'span', hProperties: { 'data-citation': citation.sourceId } },
          children: [{ type: 'text', value: child.value.slice(start, end) }],
        });

        cursor = end;
      }

      if (cursor === 0) {
        next.push(child);
      } else if (cursor < child.value.length) {
        next.push({ type: 'text', value: child.value.slice(cursor) });
      }
    }

    node.children = next;
  };

  return (tree: MarkdownNode) => scan(tree);
}

/** The deepest last node that may hold inline content, for the literal tail. */
function inlineContainerAt(node: MarkdownNode): MarkdownNode | null {
  if (INLINE_CONTAINERS.has(node.type ?? '')) return node;

  const last = node.children?.[node.children.length - 1];

  return last ? inlineContainerAt(last) : null;
}

/**
 * Replaces the trailing half-typed link with the exact characters the model
 * produced, after the parser has run.
 *
 * The parser cannot be told to leave it alone — it closes the destination at the
 * end of the input and autolinks the URL inside it — so the tree is cut at the
 * fragment's first character and that fragment is appended back as one text
 * node, which no later pass will parse.
 */
function remarkLiteralTail(tail: LiteralTail) {
  return (tree: MarkdownNode) => {
    const cut = (node: MarkdownNode) => {
      if (!node.children) return;

      const kept: MarkdownNode[] = [];

      for (const child of node.children) {
        const start = child.position?.start.offset;
        const end = child.position?.end.offset;

        if (start === undefined || end === undefined || end <= tail.start) {
          kept.push(child);
        } else if (start >= tail.start) {
          continue;
        } else if (child.type === 'text' && child.value !== undefined) {
          kept.push({ ...child, value: child.value.slice(0, tail.start - start) });
        } else {
          cut(child);
          kept.push(child);
        }
      }

      node.children = kept;
    };

    cut(tree);

    const last = tree.children?.[tree.children.length - 1];
    const container =
      last && (last.position?.end.offset ?? 0) > tail.start ? inlineContainerAt(last) : null;

    // The fragment began a block of its own: it keeps a block of its own.
    // The `literal` flag keeps the marker pass from parsing inside it.
    const literal = { type: 'text', value: tail.value, data: { literal: true } };

    if (container) container.children?.push(literal);
    else tree.children?.push({ type: 'paragraph', children: [literal] });
  };
}

/**
 * A fenced block is the library's code block chrome, never a bare `<pre>`.
 *
 * The chrome is markup only: the language is a title and the copy button takes
 * the raw text, so the response needs no syntax engine and no highlighting peer.
 */
function MarkdownPre({ node }: { node?: MarkdownNode; children?: React.ReactNode }) {
  const code = node?.children?.[0];
  const text = textOf(code);
  const language = languageOf(code);

  return (
    <CodeBlock>
      <CodeBlockHeader>
        {language ? <CodeBlockTitle>{language}</CodeBlockTitle> : null}
        <CodeBlockActions>
          <CodeBlockCopyButton value={text} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent>{text}</CodeBlockContent>
    </CodeBlock>
  );
}

/** What a marker needs from the response to render itself. */
const CitationContext = React.createContext<{
  citations: readonly Citation[];
  renderMarker?: CitationRender;
  documentHref?: DocumentHref;
}>({ citations: [] });

/** The marker node the citation pass inserts; every other span is left alone. */
function MarkdownSpan({
  node,
  children,
  ...props
}: Omit<React.ComponentProps<'span'>, 'children'> & {
  children?: React.ReactNode;
  node?: MarkdownNode;
}) {
  const sourceId = node?.properties?.['data-citation'];
  const { citations, renderMarker, documentHref } = React.useContext(CitationContext);
  const citation =
    typeof sourceId === 'string'
      ? citations.find((candidate) => candidate.sourceId === sourceId)
      : undefined;

  if (citation) {
    return <CitationMarker citation={citation} render={renderMarker} documentHref={documentHref} />;
  }

  return <span {...props}>{children}</span>;
}

/**
 * Module scope on purpose: a fresh component function on every chunk would be a
 * new element type to React, which unmounts and remounts every block of the
 * answer — losing selection, scroll and focus mid-stream.
 */
const COMPONENTS: Components = {
  pre: MarkdownPre,
  span: MarkdownSpan,
};

/**
 * The model's answer, as GFM markdown.
 *
 * A `text` part arrives in chunks, so the renderer has to survive each one: the
 * tree keeps its block identity while text is appended, and the citation markers
 * in the prose resolve against the message's source parts.
 */
function Response({
  part,
  parts = [],
  resolveCitation = resolveMarkers,
  renderMarker,
  documentHref,
  className,
  ...props
}: ResponseProps) {
  if (part.text.trim().length === 0) return null;

  const citations = getCitations(parts);
  const tail = incompleteLinkOf(part.text);
  const plugins: NonNullable<React.ComponentProps<typeof Markdown>['remarkPlugins']> = [remarkGfm];

  // The literal tail runs before the marker pass, so a half-typed link can never
  // have a marker resolved inside it.
  if (tail) plugins.push([remarkLiteralTail, tail]);

  plugins.push([remarkCitations, { citations, resolve: resolveCitation }]);

  return (
    <div
      data-slot="response"
      data-state={part.state}
      className={cn('prose-response flex min-w-0 flex-col gap-3', className)}
      {...props}
    >
      <CitationContext.Provider value={{ citations, renderMarker, documentHref }}>
        <Markdown remarkPlugins={plugins} components={COMPONENTS}>
          {part.text}
        </Markdown>
      </CitationContext.Provider>
    </div>
  );
}

export { Response };
