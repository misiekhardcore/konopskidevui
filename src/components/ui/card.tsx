'use client';

import { cn } from 'cn';
import { Slot } from 'radix-ui';
import * as React from 'react';

type CardProps = React.ComponentProps<'div'> & {
  /** Adds a subtle hover affordance for cards that behave as links. */
  interactive?: boolean;
};

function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col card',
        interactive && 'transition-colors hover:border-foreground/25',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-header" className={cn('flex flex-col gap-2 p-5', className)} {...props} />
  );
}

interface CardTitleProps extends React.ComponentProps<'div'> {
  /** Render as a different element (e.g. h2, h3) while preserving styling. */
  asChild?: boolean;
}

function CardTitle({ className, asChild = false, ...props }: CardTitleProps) {
  const Comp = asChild ? Slot.Root : 'div';

  return (
    <Comp
      data-slot="card-title"
      className={cn('font-display text-h3 font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-base leading-relaxed text-muted-foreground', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('flex flex-col gap-2 p-5 pt-0', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center p-5 pt-0', className)}
      {...props}
    />
  );
}

interface CardImageProps {
  aspect?: string;
  className?: string;
  /**
   * The media itself. Required on purpose: an aspect box with nothing in it is
   * never the intended result, and making it optional pushed every call site
   * into guarding the frame with its own conditional.
   */
  children: React.ReactNode;
}

/**
 * A bleeding card image, sized by aspect ratio. Framework-agnostic on purpose:
 * this package never imports a framework-specific image component, so the same
 * card works in Vite, Astro, Next or a plain HTML page.
 */
function CardImage({ className, aspect = 'aspect-video', children }: CardImageProps) {
  return (
    <div
      data-slot="card-image"
      className={cn('relative overflow-hidden rounded-t-sm', aspect, className)}
    >
      {children}
    </div>
  );
}
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardImage,
  type CardProps,
  type CardTitleProps,
  type CardImageProps,
};
