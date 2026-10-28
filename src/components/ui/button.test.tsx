import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button, buttonVariants } from './button';

describe('Button', () => {
  it('renders a button with its label', () => {
    render(<Button>Save changes</Button>);

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Safe</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies the house radius and focus treatment', () => {
    render(<Button>Styled</Button>);

    expect(screen.getByRole('button').className).toContain('rounded-sm');
    expect(screen.getByRole('button').className).toContain('focus-ring');
  });

  it.each([
    ['default', 'bg-primary'],
    ['primary', 'bg-primary'],
    ['secondary', 'bg-secondary'],
    ['destructive', 'bg-destructive'],
    ['outline', 'border-border'],
    ['ghost', 'bg-transparent'],
    ['ghost-primary', 'text-primary'],
    ['ghost-destructive', 'text-destructive'],
    ['link', 'underline-offset-4'],
  ] as const)('renders the %s variant', (variant, expectedClass) => {
    render(<Button variant={variant}>Variant</Button>);

    expect(screen.getByRole('button').className).toContain(expectedClass);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant);
  });

  it.each([
    ['xs', 'px-2'],
    ['sm', 'px-3'],
    ['default', 'px-4'],
    ['lg', 'px-6'],
    ['icon', 'p-2.5'],
    ['icon-lg', 'p-3'],
  ] as const)('renders the %s size', (size, expectedClass) => {
    render(<Button size={size}>Sized</Button>);

    expect(screen.getByRole('button').className).toContain(expectedClass);
  });

  it('renders its child instead of a button when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/articles">Read more</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Read more' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/articles');
    expect(link.className).toContain('rounded-sm');
  });

  it('merges a caller className over the variant classes', () => {
    render(<Button className="mt-4 px-10">Merged</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('mt-4');
    // tailwind-merge semantics: the caller's padding wins.
    expect(button.className).toContain('px-10');
    expect(button.className).not.toContain('px-4');
  });

  it('is disabled when asked, and cannot be clicked', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards a ref to the underlying element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('exposes a variants helper that can be composed onto other elements', () => {
    expect(buttonVariants({ variant: 'outline', size: 'lg' })).toContain('border-border');
    expect(buttonVariants({ variant: 'outline', size: 'lg' })).toContain('px-6');
  });
});
