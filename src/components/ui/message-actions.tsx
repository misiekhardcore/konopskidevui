import { cn } from 'cn';
import { CheckIcon, CopyIcon, ThumbsUpIcon } from 'lucide-react';
import * as React from 'react';

/**
 * Copies the given value to the system clipboard and announces the result.
 * The onCopy callback is called; if it returns a Promise, we wait for it.
 */
async function performCopy(value: string, onCopy: () => void | Promise<void>) {
  await onCopy?.();

  // Announce confirmation to assistive technology
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('role', 'status');
  announcement.className = 'sr-only';
  announcement.textContent = 'Copied';
  document.body.appendChild(announcement);

  // Remove after 2 seconds
  setTimeout(() => {
    announcement.remove();
  }, 2000);
}

export function MessageActions({
  onCopy,
  onFeedback,
  onRegenerate,
  onEdit,
  copyValue,
  initialFeedback,
  ...props
}: {
  onCopy?: (value: string) => void | Promise<void>;
  onFeedback?: (vote: 'up' | 'down') => void;
  onRegenerate?: () => void | Promise<void>;
  onEdit?: () => void | Promise<void>;
  copyValue?: string;
  initialFeedback?: 'up' | 'down' | null;
} & React.ComponentProps<'div'>) {
  const hasActions =
    Boolean(onCopy) || Boolean(onFeedback) || Boolean(onRegenerate) || Boolean(onEdit);

  if (!hasActions) return null;

  // Feedback state: use a local controlled component to manage the pressed state
  const [feedbackPressed, setFeedbackPressed] = React.useState<
    'up' | 'down' | null
  >(initialFeedback ?? null);

  return (
    <div
      data-slot="message-actions"
      className={cn(
        'flex min-w-0 max-w-full flex-wrap items-center gap-2',
        'data-[state=pending]:pointer-events-none data-[state=pending]:opacity-50',
        props.className,
      )}
      {...props}
    >
      {/* Copy action */}
      {onCopy && (
        <button
          type="button"
          data-slot="message-copy"
          aria-label={`Copy ${copyValue ?? 'message'} message`}
          aria-live="polite"
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          )}
          onClick={async () => {
            if (onCopy && copyValue) await performCopy(copyValue, onCopy);
          }}
        >
          <CopyIcon className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Feedback action */}
      {onFeedback && (
        <button
          type="button"
          data-slot="message-feedback"
          aria-label={feedbackPressed === 'up' ? 'Remove feedback' : 'Give feedback'}
          aria-pressed={feedbackPressed === 'up'}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
            feedbackPressed === 'up' && 'bg-primary text-primary-foreground',
          )}
          onClick={() => {
            const next =
              feedbackPressed === 'up' ? 'down' : feedbackPressed === 'down' ? null : 'up';
            setFeedbackPressed(next);
            onFeedback(next);
          }}
        >
          <ThumbsUpIcon className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Regenerate action */}
      {onRegenerate && (
        <button
          type="button"
          data-slot="message-regenerate"
          aria-label="Regenerate message"
          className={cn(
            'inline-flex h-7 items-center justify-center gap-2 rounded-sm px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          )}
          onClick={onRegenerate}
        >
          Regenerate
        </button>
      )}

      {/* Edit action */}
      {onEdit && (
        <button
          type="button"
          data-slot="message-edit"
          aria-label="Edit message"
          className={cn(
            'inline-flex h-7 items-center justify-center gap-2 rounded-sm px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          )}
          onClick={onEdit}
        >
          Edit
        </button>
      )}
    </div>
  );
}