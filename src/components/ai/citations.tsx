'use client';

import { cn } from 'cn';
import * as React from 'react';

import { getCitations } from '../../lib/citations';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

import type { Citation, SourceInputPart } from '../../lib/citations';

/** A marker's replacement: it receives the citation it resolves to and owns the whole render. */
export type CitationRender = (citation: Citation) => React.ReactNode;

/**
 * Where an app serves a document it cited, or `undefined` for one it cannot.
 *
 * A `source-document` part names its document but carries no URL, so the library
 * has no page to point a marker at; only the app knows where the file lives.
 */
export type DocumentHref = (citation: Citation) => string | undefined;

/** Every user-facing string, so the list can be translated without a fork. */
export type SourcesLabels = {
  title: string;
};

const DEFAULT_LABELS: SourcesLabels = {
  title: 'Sources',
};

export type CitationMarkerProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  citation: Citation;
  /** Replace the marker's whole rendering; the default marker stays in use when omitted. */
  render?: CitationRender;
  /**
   * Where to download a document citation from; the marker is a note, not a
   * link, for a citation this resolves to `undefined` or does not cover.
   */
  documentHref?: DocumentHref;
};

export type SourcesProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The message's parts; only the two source kinds are read. */
  parts: readonly SourceInputPart[];
  /** Override the strings shown, one at a time. */
  labels?: Partial<SourcesLabels>;
  /** The same marker override the response applies to the markers inside its prose. */
  renderMarker?: CitationRender;
  /** The same document resolver the response applies to the markers inside its prose. */
  documentHref?: DocumentHref;
};

/** The second line of a preview: where the source can be reached, or what file it is. */
function detailOf(citation: Citation): string | null {
  if (citation.url) return citation.url;

  return citation.filename ?? citation.mediaType ?? null;
}

/**
 * The marker's accessible name.
 *
 * It leads with the source title, because a number on its own says nothing to a
 * screen reader. The number stays in the name as well: WCAG 2.5.3 wants the
 * visible label to be part of the accessible name, so naming the marker after
 * the title alone fails axe's `label-content-name-mismatch`. The number is a
 * separate word rather than a parenthetical because axe strips parentheticals
 * before it compares the name to the visible label.
 */
function accessibleNameOf(citation: Citation): string {
  return `${citation.title}, ${citation.marker}`;
}

const MARKER_CLASS =
  'inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-sm border border-current px-1 text-xs leading-none font-medium tabular-nums transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';

const TRIGGER_CLASS = cn(MARKER_CLASS, 'text-muted-foreground hover:text-foreground');

/**
 * The marker a source is cited by, inline in the response.
 *
 * It reads as `1`, not as a source title, but its accessible name leads with
 * the title — the number alone means nothing out of context. The preview is on the same
 * element, so a reader gets the title and where it came from on hover and on
 * keyboard focus, and a URL source is also the link to that page. A document
 * source has no page of its own, so it stays a note unless `documentHref` says
 * where the app serves it, which makes the marker a download. A `render`
 * override replaces the marker entirely, which is how an app swaps in its own
 * router's link or its own analytics wrapper (#26 uses the same override inside
 * prose).
 */
function CitationMarker({
  citation,
  render,
  documentHref,
  className,
  ...props
}: CitationMarkerProps) {
  // An override is the whole marker, not a slot inside it: an app replacing the
  // rendering should not inherit the default's preview or its chip.
  if (render) return <>{render(citation)}</>;

  const detail = detailOf(citation);
  // A page citation already has somewhere to go; the resolver is for documents.
  const download = citation.url ? undefined : documentHref?.(citation);

  const trigger = citation.url ? (
    <a
      data-slot="citation-marker-trigger"
      href={citation.url}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={accessibleNameOf(citation)}
      className={TRIGGER_CLASS}
    >
      {citation.marker}
    </a>
  ) : download ? (
    // The app serves this document, so the marker is the download of it.
    <a
      data-slot="citation-marker-trigger"
      href={download}
      download={citation.filename ?? undefined}
      aria-label={accessibleNameOf(citation)}
      className={TRIGGER_CLASS}
    >
      {citation.marker}
    </a>
  ) : (
    // A document has no page to open and the app serves none, so its marker is
    // a note rather than a link: focusable for the preview, named by the title,
    // and not a dead button that would promise an action it cannot take.
    <span
      data-slot="citation-marker-trigger"
      role="note"
      tabIndex={0}
      aria-label={accessibleNameOf(citation)}
      className={TRIGGER_CLASS}
    >
      {citation.marker}
    </span>
  );

  return (
    <span
      data-slot="citation-marker"
      className={cn('inline-flex align-super', className)}
      {...props}
    >
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent data-slot="citation-preview" className="block max-w-xs px-3 py-2">
            <span data-slot="citation-preview-title" className="block font-medium">
              {citation.title}
            </span>
            {detail ? (
              <span
                data-slot="citation-preview-detail"
                className="mt-0.5 block break-all text-background/80"
              >
                {detail}
              </span>
            ) : null}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}

/**
 * The message's sources, as one ordered citation list.
 *
 * It is the same list the response's inline markers are numbered against, so a
 * duplicated source is one entry with one number rather than two. The list is
 * labelled — visibly, and for assistive technology — and it renders nothing at
 * all for a message that cited nothing, so it can be mounted unconditionally
 * under every answer.
 */
function Sources({ parts, labels, renderMarker, documentHref, className, ...props }: SourcesProps) {
  const citations = getCitations(parts);
  const titleId = React.useId();
  const text = { ...DEFAULT_LABELS, ...labels };

  if (citations.length === 0) return null;

  return (
    <div
      data-slot="sources"
      className={cn('flex w-full min-w-0 flex-col gap-2', className)}
      {...props}
    >
      <p
        data-slot="sources-title"
        id={titleId}
        className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
      >
        {text.title}
      </p>
      <ol
        data-slot="sources-list"
        aria-labelledby={titleId}
        className="flex min-w-0 list-none flex-col gap-1.5 p-0"
      >
        {citations.map((citation) => {
          const detail = detailOf(citation);

          return (
            <li
              key={citation.marker}
              data-slot="source"
              className="flex min-w-0 items-start gap-2 text-sm"
            >
              <CitationMarker
                citation={citation}
                render={renderMarker}
                documentHref={documentHref}
              />
              <span className="flex min-w-0 flex-col">
                {/* The marker already links out, so the title is not a second
                    link with the same accessible name beside it. */}
                <span data-slot="source-title" className="wrap-break-word text-foreground">
                  {citation.title}
                </span>
                {detail ? (
                  <span
                    data-slot="source-detail"
                    className="text-xs break-all text-muted-foreground"
                  >
                    {detail}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export { CitationMarker, Sources };
export type { Citation, SourcePart } from '../../lib/citations';
