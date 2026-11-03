'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import * as React from 'react';
import { Toaster as Sonner, toast, type ToasterProps } from 'sonner';

import { useTheme } from './theme-provider';

type SonnerTheme = NonNullable<ToasterProps['theme']>;

export interface ToasterComponentProps extends ToasterProps {
  /**
   * Overrides the nearest `ThemeProvider` for this surface only. Left unset,
   * the toaster follows the resolved next-themes theme, and falls back to
   * `system` (which follows `prefers-color-scheme`) outside a provider.
   */
  theme?: SonnerTheme;
}

function Toaster({ className, theme, ...props }: ToasterComponentProps) {
  const { resolvedTheme } = useTheme();
  const providerTheme: SonnerTheme | undefined =
    resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : undefined;

  return (
    <Sonner
      theme={theme ?? providerTheme ?? 'system'}
      data-slot="sonner"
      className={cnToaster(className)}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius-sm)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'font-sans',
        },
      }}
      {...props}
    />
  );
}

function cnToaster(className?: string) {
  return ['toaster group', className].filter(Boolean).join(' ');
}

export { Toaster };

/**
 * Raises a toast into the nearest mounted `Toaster`.
 *
 * Re-exported from `sonner` so a consumer renders the region and queues into it
 * from one module, instead of pairing this component with a separate `sonner`
 * import. The `success`, `error`, `warning`, `info`, `loading`, `promise`,
 * `custom`, `message` and `dismiss` helpers come attached to the same function.
 */
export { toast };
