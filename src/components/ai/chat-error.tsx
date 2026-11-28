import { cn } from 'cn';
import { CircleAlertIcon } from 'lucide-react';
import * as React from 'react';

import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

/** Every user-facing string, so the surface can be translated without a fork. */
export type ChatErrorLabels = {
  /** Shown when neither the error nor its message says anything. */
  fallback: string;
  /** The retry action's name. */
  retry: string;
  /** The dismiss action's name. */
  dismiss: string;
};

const DEFAULT_LABELS: ChatErrorLabels = {
  fallback: 'The conversation could not continue. Please try again.',
  retry: 'Try again',
  dismiss: 'Dismiss',
};

export type ChatErrorProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The error a conversation stopped on, or the text the app read from one. */
  error?: string | Error | null;
  /** Override the strings shown, one at a time. */
  labels?: Partial<ChatErrorLabels>;
  /** Called when the reader asks for another attempt; no action without it. */
  onRetry?: () => void | Promise<void>;
  /** Called when the reader dismisses the error; no action without it. */
  onDismiss?: () => void | Promise<void>;
};

/**
 * The error's own text, or the fallback when it has none. A provider's message
 * is passed through untouched: an app shows what the service said, even when it
 * has no translation for it. A blank message is no message, so it falls back
 * instead of leaving the alert empty.
 */
function messageOf(error: string | Error | null | undefined, fallback: string): string {
  const given = typeof error === 'string' ? error : (error?.message ?? '');

  return given.trim() ? given : fallback;
}

/**
 * A conversation-level error.
 *
 * It is a body rather than a panel of its own: it sits in place of the answer
 * the transcript was waiting for, reads the message it was given word for word,
 * and offers an action only when the app wires one. Retry and dismiss emit and
 * nothing more — the app decides what another attempt means and what dismissing
 * leaves on screen.
 */
function ChatError({ error, labels, onRetry, onDismiss, className, ...props }: ChatErrorProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const message = messageOf(error, text.fallback);

  return (
    <Alert data-chat-error="" variant="destructive" className={cn('min-w-0', className)} {...props}>
      <CircleAlertIcon aria-hidden="true" />
      <AlertDescription data-slot="chat-error-message" className="wrap-break-word">
        {message}
      </AlertDescription>

      {(onRetry || onDismiss) && (
        <div
          data-slot="chat-error-actions"
          className="col-span-full mt-2 flex flex-wrap items-center gap-2"
        >
          {onRetry && (
            <Button
              data-slot="chat-error-retry"
              size="sm"
              variant="outline-destructive"
              onClick={() => void onRetry()}
            >
              {text.retry}
            </Button>
          )}
          {onDismiss && (
            <Button
              data-slot="chat-error-dismiss"
              size="sm"
              variant="ghost"
              onClick={() => void onDismiss()}
            >
              {text.dismiss}
            </Button>
          )}
        </div>
      )}
    </Alert>
  );
}

export { ChatError };
