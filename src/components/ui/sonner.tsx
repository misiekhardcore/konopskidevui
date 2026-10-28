'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import * as React from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

type SonnerTheme = NonNullable<ToasterProps['theme']>;

export interface ToasterComponentProps extends ToasterProps {
  /**
   * Sonner reads no theme provider of its own. The library is deliberately
   * framework-agnostic, so the app passes its theme down (or leaves it on
   * `system`, which follows `prefers-color-scheme`).
   */
  theme?: SonnerTheme;
}

function Toaster({ className, theme = 'system', ...props }: ToasterComponentProps) {
  return (
    <Sonner
      theme={theme}
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
