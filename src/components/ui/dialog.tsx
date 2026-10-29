'use client';

import { cn } from 'cn';
import { XIcon } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import * as React from 'react';

import { Button } from './button';

/**
 * The bare layer: full viewport, none of the card chrome and no entrance
 * animation. A viewer that already covers the screen has nothing to fly in.
 */
const BARE_CONTENT_CLASS =
  'fixed inset-0 z-[var(--z-index-modal)] outline-none focus-visible:outline-none';

const DEFAULT_CONTENT_CLASS =
  'fixed top-1/3 left-1/2 z-[var(--z-index-modal)] grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-sm border border-border bg-background p-6 shadow-lg duration-200 outline-none sm:max-w-lg md:top-1/2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-top-[20%] data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:slide-out-to-top-[20%]';

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 isolate z-[var(--z-index-overlay)] bg-black/80 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  );
}

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  /**
   * @deprecated Use `closeButton` instead. Kept so existing call sites keep
   * working; `closeButton` wins when both are set.
   */
  showCloseButton?: boolean;
  /**
   * The corner affordance. `false` removes it, `true` (the default) renders the
   * house ghost button, and a node replaces it — pass a single element, since it
   * becomes the `Dialog.Close` trigger. Use this when the surface behind the
   * button is not `bg-background` and the default ghost button would disappear.
   */
  closeButton?: boolean | React.ReactNode;
  /** Classes for the backdrop. The layer is not otherwise reachable. */
  overlayClassName?: string;
  /** Render the backdrop at all. Defaults to `true`. */
  showOverlay?: boolean;
  /**
   * `default` is the centred card. `bare` is a full-viewport layer with no
   * border, background, padding, radius, shadow, cap or animation, for layouts
   * that compose their own surface — an image viewer, a slide-over, a canvas.
   */
  variant?: 'default' | 'bare';
};

function DialogContent({
  className,
  children,
  showCloseButton,
  closeButton,
  overlayClassName,
  showOverlay = true,
  variant = 'default',
  ...props
}: DialogContentProps) {
  // `showCloseButton` is the older boolean form; `closeButton` supersedes it.
  const resolvedCloseButton = closeButton ?? (showCloseButton === false ? false : true);

  return (
    <DialogPortal>
      {showOverlay && <DialogOverlay className={overlayClassName} />}
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-variant={variant}
        className={cn(variant === 'bare' ? BARE_CONTENT_CLASS : DEFAULT_CONTENT_CLASS, className)}
        {...props}
      >
        {children}
        {resolvedCloseButton === true && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button variant="ghost" size="icon-sm" className="absolute top-4 right-4">
              <XIcon className="size-5" />
              <span className="sr-only">Close modal</span>
            </Button>
          </DialogPrimitive.Close>
        )}
        {resolvedCloseButton !== true && resolvedCloseButton !== false && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            {resolvedCloseButton}
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/**
 * The unstyled content primitive, for a layout `DialogContent` cannot express.
 *
 * Compose it inside `DialogPortal` with `DialogOverlay`, which is exported and
 * takes a `className`:
 *
 * ```tsx
 * <DialogPortal>
 *   <DialogOverlay className="bg-foreground/50" />
 *   <DialogContentPrimitive className="fixed inset-0">…</DialogContentPrimitive>
 * </DialogPortal>
 * ```
 *
 * `variant="bare"` covers the common case; this exists for everything else.
 */
function DialogContentPrimitive({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Content
      data-slot="dialog-content"
      className={cn('outline-none', className)}
      {...props}
    />
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="dialog-header" className={cn('flex flex-col gap-1.5', className)} {...props} />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('font-display text-h3 leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogContentPrimitive,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
};
