import { cn } from 'cn';
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

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
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

interface CardImageProps extends Omit<React.ComponentProps<'img'>, 'src'> {
  src?: string | null;
  alt: string;
  /** Tailwind aspect ratio utility for the media box. */
  aspect?: string;
}

/**
 * A bleeding card image, sized by aspect ratio. Framework-agnostic on purpose:
 * this package never imports a framework-specific image component, so the same
 * card works in Vite, Astro, Next or a plain HTML page.
 */
function CardImage({ className, src, alt, aspect = 'aspect-[16/9]', ...props }: CardImageProps) {
  if (!src) return null;

  return (
    <div
      data-slot="card-image"
      className={cn('relative overflow-hidden rounded-t-sm', aspect, className)}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        {...props}
      />
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
  type CardImageProps,
};
