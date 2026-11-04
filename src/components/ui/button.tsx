import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';
import { Slot } from 'radix-ui';
import * as React from 'react';

/**
 * konopskidev's button.
 *
 * The variant and size names are a superset of shadcn/ui's: everything upstream
 * accepts still works, and the site's extras (`primary`, `ghost-primary`,
 * `ghost-destructive`, the `icon-*` sizes) sit alongside them. Sizing is
 * the house control scale — 24/32/40/48px — so the default size lines up with
 * the 40px `Input`.
 */
const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-sm border border-transparent font-sans text-sm font-medium whitespace-nowrap focus-ring transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border-border bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground',
        'ghost-primary': 'bg-transparent text-primary hover:bg-primary/10',
        'ghost-destructive': 'bg-transparent text-destructive hover:bg-destructive/10',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4',
        xs: 'h-6 gap-1 px-2 text-xs [&_svg:not([class*=size-])]:size-3',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-6',
        'icon-xs': 'size-6 [&_svg:not([class*=size-])]:size-3',
        'icon-sm': 'size-8',
        icon: 'size-10',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /** Render the single child element instead of a `<button>`. */
  asChild?: boolean;
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
