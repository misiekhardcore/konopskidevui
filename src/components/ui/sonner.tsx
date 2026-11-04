import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import * as React from 'react';
import { Toaster as Sonner, toast, type ToasterProps } from 'sonner';

type SonnerTheme = NonNullable<ToasterProps['theme']>;

export interface ToasterComponentProps extends ToasterProps {
  /**
   * Opt out of the house surface and use sonner's own palette for this toaster.
   * Left unset, the toast follows the page's tokens and `.dark` class like every
   * other component — it does not read `ThemeProvider`.
   */
  theme?: SonnerTheme;
}

function Toaster({ className, theme, ...props }: ToasterComponentProps) {
  const pageTheme = theme === undefined;

  return (
    <Sonner
      theme={theme}
      className={cnToaster(className, pageTheme)}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--border-radius': 'var(--radius-sm)',
          // sonner spreads its own variables first, so these win. The rest of
          // the theme-keyed rules live in `src/styles/sonner.css`.
          ...(pageTheme
            ? {
                '--normal-bg': 'var(--popover)',
                '--normal-text': 'var(--popover-foreground)',
                '--normal-border': 'var(--border)',
                '--gray11': 'var(--muted-foreground)',
              }
            : {}),
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

function cnToaster(className?: string, pageTheme = true) {
  return ['toaster', 'group', pageTheme && 'toaster-page', className].filter(Boolean).join(' ');
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
