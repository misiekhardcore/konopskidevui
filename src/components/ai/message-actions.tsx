'use client';

import { cn } from 'cn';
import { CheckIcon, CopyIcon, Pencil, RefreshCw, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '../ui/button';
import { Toggle } from '../ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

import type { ComponentProps } from 'react';

/** The vote a reader can record on a message. */
export type MessageFeedbackVote = 'up' | 'down';

/** How long the copy control stays in its confirmed state. */
const CONFIRMATION_MS = 2000;

/**
 * The per-message action row.
 *
 * Every action is optional and an action is rendered only when the app wires the
 * handler that makes it work: an unhandled action is absent, never a dead
 * button. With no handlers at all the row renders nothing, so it can be mounted
 * under every message in a transcript.
 *
 * Copy receives the message text and writes it itself; the row then shows a
 * check and announces the confirmation through a live region once the write
 * resolves. Feedback is one control — a labelled pair of pressed toggles fed by
 * the single vote the app recorded — so switching votes replaces the previous
 * one instead of leaving both pressed. Regenerate and edit only emit: the row
 * never changes what the message displays.
 */
export type MessageActionsProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The message text; the copy action needs it to have something to write. */
  copyValue?: string;
  /** Writes the message text, e.g. to the clipboard. Copy is absent without it. */
  onCopy?: (value: string) => void | Promise<void>;
  /** The vote recorded for this message, or `null` for none. */
  feedback?: MessageFeedbackVote | null;
  /** Reports the vote the reader pressed. Without it, no feedback is rendered. */
  onFeedbackChange?: (vote: MessageFeedbackVote | null) => void;
  onRegenerate?: () => void | Promise<void>;
  onEdit?: () => void | Promise<void>;
};

function MessageActions({
  copyValue,
  onCopy,
  feedback,
  onFeedbackChange,
  onRegenerate,
  onEdit,
  className,
  ...props
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const copies = Boolean(onCopy) && copyValue !== undefined;

  // Copy without the text it would write is not an action the app wired up, so
  // it does not count towards rendering the row.
  if (!copies && !onFeedbackChange && !onRegenerate && !onEdit) return null;

  async function handleCopy() {
    if (!onCopy || copyValue === undefined) return;

    try {
      await onCopy(copyValue);
    } catch {
      // The app reports its own failure; the row must not claim success.
      setCopied(false);
      return;
    }

    setCopied(true);

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), CONFIRMATION_MS);
  }

  return (
    <TooltipProvider>
      <div
        data-slot="message-actions"
        className={cn('flex max-w-full min-w-0 flex-wrap items-center gap-2', className)}
        {...props}
      >
        {copies ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                data-slot="message-copy"
                data-copied={copied || undefined}
                aria-label="Copy message"
                variant="ghost"
                size="icon-xs"
                onClick={() => void handleCopy()}
              >
                {copied ? (
                  <CheckIcon className="h-3.5 w-3.5" />
                ) : (
                  <CopyIcon className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy to clipboard</TooltipContent>
          </Tooltip>
        ) : null}

        {copies ? (
          <span data-slot="message-copy-status" role="status" className="sr-only">
            {copied ? 'Copied to clipboard' : ''}
          </span>
        ) : null}

        {onFeedbackChange ? (
          // One control, fed by one vote: both toggles read their pressed state
          // from `feedback`, so the group can never hold two votes at once and
          // a new vote replaces the previous one.
          <div
            data-slot="message-feedback"
            role="group"
            aria-label="Message feedback"
            className="flex items-center gap-0.5"
          >
            <Toggle
              size="sm"
              pressed={feedback === 'up'}
              aria-label="Helpful"
              title="Helpful"
              className="size-6 min-w-6 px-0"
              onPressedChange={(pressed) => onFeedbackChange(pressed ? 'up' : null)}
            >
              <ThumbsUpIcon className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={feedback === 'down'}
              aria-label="Not helpful"
              title="Not helpful"
              className="size-6 min-w-6 px-0"
              onPressedChange={(pressed) => onFeedbackChange(pressed ? 'down' : null)}
            >
              <ThumbsDownIcon className="h-3.5 w-3.5" />
            </Toggle>
          </div>
        ) : null}

        {onRegenerate ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                data-slot="message-regenerate"
                aria-label="Regenerate message"
                onClick={() => void onRegenerate()}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Regenerate message</TooltipContent>
          </Tooltip>
        ) : null}

        {onEdit ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                data-slot="message-edit"
                aria-label="Edit message"
                onClick={() => void onEdit()}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit message</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </TooltipProvider>
  );
}

export { MessageActions };
