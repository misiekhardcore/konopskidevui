'use client';

import { cn } from 'cn';
import * as React from 'react';

import { getPlaceholder } from '../../lib/get-placeholder';

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  /** Validation message rendered under the field. */
  error?: string;
  /** Grow the field with its content instead of scrolling. */
  autoHeight?: boolean;
}

function Textarea({ className, error, autoHeight, placeholder, ...props }: TextareaProps) {
  const innerRef = React.useRef<HTMLTextAreaElement>(null);

  React.useImperativeHandle(props.ref, () => innerRef.current!);

  React.useEffect(() => {
    resizeTextArea(innerRef.current, autoHeight);
  }, [autoHeight, props.value]);

  return (
    <div className="w-full">
      <textarea
        data-slot="textarea"
        aria-invalid={error ? true : props['aria-invalid']}
        placeholder={getPlaceholder(placeholder, props.required)}
        className={cn(
          'flex min-h-20 w-full resize-y rounded-sm border border-input bg-background px-3 py-2 font-sans text-sm focus-ring transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive',
          autoHeight && 'resize-none',
          className,
        )}
        {...props}
        ref={innerRef}
      />
      {error ? (
        <p data-slot="textarea-error" className="mt-2 text-sm font-bold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function resizeTextArea(textarea: HTMLTextAreaElement | null, auto?: boolean) {
  if (!textarea) return;

  if (auto) {
    textarea.style.height = `${textarea.scrollHeight}px`;
  } else {
    textarea.style.height = 'auto';
  }
}

export { Textarea };
