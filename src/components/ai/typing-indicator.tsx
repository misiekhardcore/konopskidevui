import { cn } from 'cn';

import type { ChatStatus } from 'ai';
import type * as React from 'react';

/** Every user-facing string, so the indicator can be translated without a fork. */
export type TypingIndicatorLabels = {
  /** The pending response a screen reader hears once, when the wait begins. */
  waiting: string;
};

const DEFAULT_LABELS: TypingIndicatorLabels = {
  waiting: 'Waiting for a response',
};

export type TypingIndicatorProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The conversation status, straight from `useChat`. Only a pending turn waits. */
  status: ChatStatus;
  /**
   * Whether the message already shows something. Any rendered part ends the
   * wait, so the app says what it has rather than leaving a second indicator
   * under a streaming answer.
   */
  hasContent?: boolean;
  /** Override the announcement, one string at a time. */
  labels?: Partial<TypingIndicatorLabels>;
};

/** How many dots the animation draws, each one step behind the previous. */
const DOTS = [0, 1, 2] as const;

/**
 * The wait before an answer's first token.
 *
 * A slow first token otherwise looks like a hang. The dots animate with CSS
 * only, so nothing ticks in JavaScript; a reader who prefers reduced motion gets
 * the same three dots, still. The whole row is one polite live region whose only
 * text is the announcement, and the dots sit outside the accessibility tree, so
 * a frame can never repeat it.
 *
 * It renders nothing once the turn is over or the message already has content,
 * so it can be mounted under every answer without the app checking the status
 * first. One line of the answer's own typography is reserved, so the first token
 * takes its place without moving the transcript.
 */
function TypingIndicator({ status, hasContent = false, labels, ...props }: TypingIndicatorProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const pending = status === 'submitted' || status === 'streaming';

  if (!pending || hasContent) return null;

  return (
    <div
      role="status"
      data-slot="typing-indicator"
      data-status={status}
      className="min-h-lh"
      {...props}
    >
      <span className="sr-only">{text.waiting}</span>
      <div
        data-slot="typing-indicator-dots"
        aria-hidden="true"
        className="flex h-full items-center gap-1"
      >
        {DOTS.map((dot) => (
          <span
            className="h-full animate-bounce motion-reduce:animate-bounce"

            style={{ animationDelay: `${-0.3 + dot * 0.15}s` }}
          >
            <span
              key={dot}
              data-slot="typing-indicator-dot"
              className="inline-block size-1 rounded-full bg-current"
            />
          </span>
        ))}
      </div>
    </div>
  );
}

export { TypingIndicator };
