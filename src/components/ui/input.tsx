import { cn } from 'cn';
import * as React from 'react';

import { getPlaceholder } from '../../lib/get-placeholder';

export interface InputProps extends React.ComponentProps<'input'> {
  /**
   * Validation message rendered under the field. A string renders one line;
   * pass `aria-invalid` yourself when you want the border treatment too.
   */
  error?: string;
}

function Input({ className, type, error, placeholder, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        type={type}
        data-slot="input"
        aria-invalid={error ? true : props['aria-invalid']}
        placeholder={getPlaceholder(placeholder, props.required)}
        className={cn(
          'flex h-10 w-full min-w-0 rounded-sm border border-input bg-background px-3 py-2 font-sans text-sm focus-ring transition-colors file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive',
          className,
        )}
        {...props}
      />
      {error ? (
        <p data-slot="input-error" className="mt-2 text-sm font-bold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { Input };
