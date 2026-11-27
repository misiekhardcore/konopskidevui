'use client';

import * as React from 'react';

import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceLine,
  TraceTitle,
} from '../ui/trace';

import type { ReasoningUIPart } from 'ai';

/** The SDK's reasoning part, as `useChat` hands it over. */
export type ReasoningPart = ReasoningUIPart;

/** Every user-facing string, so the part can be translated without a fork. */
export type ReasoningLabels = {
  /** The title while the model is still thinking. */
  thinking: string;
  /** The title once it has stopped. */
  thought: string;
  /** The sentence around the figure; `{duration}` is where the figure goes. */
  elapsed: string;
};

const DEFAULT_LABELS: ReasoningLabels = {
  thinking: 'Thinking',
  thought: 'Thought',
  elapsed: 'for {duration}',
};

// `part` is also a DOM attribute, so it has to leave the forwarded props or the
// element's `part?: string` would be intersected into the reasoning part.
export type ReasoningProps = Omit<React.ComponentProps<'div'>, 'children' | 'part'> & {
  part: ReasoningPart;
  /**
   * How long the model reasoned, in milliseconds. The part does not carry it, so
   * the app measures it; leave it out when the app did not.
   */
  durationMs?: number;
  /** Override the strings shown, one at a time. */
  labels?: Partial<ReasoningLabels>;
  /** Drive the disclosure instead of letting the row remember its own state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** Elapsed time as a person reads it: `4.2s`, `12s`, `1m 23s`. */
function formatDuration(ms: number): string | null {
  if (!Number.isFinite(ms) || ms < 0) return null;

  const seconds = Math.round(ms / 100) / 10;

  if (seconds < 60) return `${seconds}s`;

  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const rest = totalSeconds % 60;

  return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
}

/**
 * The model's thinking, inline in the message.
 *
 * While the part streams it is open, under a shimmering title; once it is done it
 * collapses to that title so the answer keeps the space, and the row reports how
 * long the model thought. The body is plain text, never markdown, and keeps its
 * whitespace.
 */
function Reasoning({
  part,
  durationMs,
  labels,
  open,
  onOpenChange,
  className,
  ...props
}: ReasoningProps) {
  const streaming = part.state === 'streaming';
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(streaming);
  const [wasStreaming, setWasStreaming] = React.useState(streaming);

  // The stream ends on the same mount that it started, so the row has to fold
  // itself up when the part settles rather than trusting its initial state.
  if (wasStreaming !== streaming) {
    setWasStreaming(streaming);

    if (!streaming) setUncontrolledOpen(false);
  }

  const text = { ...DEFAULT_LABELS, ...labels };
  const hasText = part.text.trim().length > 0;
  // Elapsed time is only final once the stream is over, and only reported when
  // the app measured it — an unknown duration gets no figure.
  const elapsed = streaming || durationMs === undefined ? null : formatDuration(durationMs);
  const fact = elapsed ? text.elapsed.replace('{duration}', elapsed) : null;
  const title = streaming ? text.thinking : text.thought;

  function handleOpenChange(next: boolean) {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  // A finished part with nothing to say has nothing to hide behind a frame.
  if (!streaming && !hasText && !fact) return null;

  return (
    <Trace className={className} {...props} data-slot="reasoning" data-state={part.state}>
      <TraceCollapsible open={open ?? uncontrolledOpen} onOpenChange={handleOpenChange}>
        <TraceCollapsibleTrigger>
          <TraceLine status={streaming ? 'running' : undefined}>
            {/*
              The title and the figure share one span on purpose: split into two
              spans, their text runs together in the button's accessible name.
            */}
            <TraceTitle>{fact ? `${title} ${fact}` : title}</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        {hasText ? (
          <TraceCollapsibleContent className="whitespace-pre-wrap">
            {part.text}
          </TraceCollapsibleContent>
        ) : null}
      </TraceCollapsible>
    </Trace>
  );
}

export { Reasoning };
