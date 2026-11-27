'use client';

import { cn } from 'cn';
import { CheckIcon, CopyIcon, Pencil, RefreshCw, ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

import type { ComponentProps } from 'react';

export function MessageActions({
  onCopy,
  onFeedbackUp,
  onFeedbackDown,
  onRegenerate,
  onEdit,
  copyValue,
  initialFeedback,
  ...props
}: {
  onCopy?: (value: string) => void | Promise<void>;
  onFeedbackUp?: (value: boolean) => void;
  onFeedbackDown?: (value: boolean) => void;
  onRegenerate?: () => void | Promise<void>;
  onEdit?: () => void | Promise<void>;
  copyValue?: string;
  initialFeedback?: 'up' | 'down';
} & ComponentProps<'div'>) {
  // Copy success feedback: show a check icon for a second then revert
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  // Feedback state: which vote is currently pressed
  const [feedbackVote, setFeedbackVote] = useState<'up' | 'down' | null>(initialFeedback ?? 'up');

  return (
    <TooltipProvider>
      <div
        data-slot="message-actions"
        className={cn('flex max-w-full min-w-0 flex-wrap items-center gap-2', props.className)}
        {...props}
      >
        {/* Copy action */}
        {onCopy && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                data-slot="message-copy"
                data-copied={copied || undefined}
                aria-label={copied ? 'Copied' : `Copy ${copyValue ?? 'message'} message`}
                variant="ghost"
                size="icon-xs"
                onClick={async () => {
                  if (onCopy && copyValue) {
                    await onCopy(copyValue);
                    setCopied(true);
                  }
                }}
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
        )}

        {/* Feedback Up */}
        {onFeedbackUp && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                data-slot="message-feedback-up"
                aria-label={
                  feedbackVote === 'up' ? 'Remove positive feedback' : 'Give positive feedback'
                }
                className={cn(feedbackVote === 'up' && 'bg-primary text-primary-foreground')}
                onClick={() => {
                  setFeedbackVote(feedbackVote === 'up' ? null : 'up');
                  onFeedbackUp(feedbackVote !== 'up');
                }}
              >
                <ThumbsUpIcon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {feedbackVote === 'up' ? 'Remove positive feedback' : 'Give positive feedback'}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Feedback Down */}
        {onFeedbackDown && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                data-slot="message-feedback-down"
                aria-label={
                  feedbackVote === 'down' ? 'Remove negative feedback' : 'Give negative feedback'
                }
                className={cn(feedbackVote === 'down' && 'bg-primary text-primary-foreground')}
                onClick={() => {
                  setFeedbackVote(feedbackVote === 'down' ? null : 'down');
                  onFeedbackDown(feedbackVote !== 'down');
                }}
              >
                <ThumbsDownIcon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {feedbackVote === 'down' ? 'Remove negative feedback' : 'Give negative feedback'}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Regenerate action */}
        {onRegenerate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                data-slot="message-regenerate"
                aria-label="Regenerate message"
                onClick={onRegenerate}
              >
                <RefreshCw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Regenerate message</TooltipContent>
          </Tooltip>
        )}

        {/* Edit action */}
        {onEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                data-slot="message-edit"
                aria-label="Edit message"
                onClick={onEdit}
              >
                <Pencil />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit message</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
