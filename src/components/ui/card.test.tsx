import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardImage,
  CardTitle,
} from './card';

describe('Card', () => {
  it('renders its parts in order', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('uses the house card utility: border, card surface, 4px radius', () => {
    const { container } = render(<Card>Body</Card>);
    const card = container.firstElementChild;

    expect(card?.className).toContain('card');
    expect(card).toHaveAttribute('data-slot', 'card');
  });

  it('adds the hover affordance only when interactive', () => {
    const { container, rerender } = render(<Card>Body</Card>);
    expect(container.firstElementChild?.className).not.toContain('hover:border-foreground/25');

    rerender(<Card interactive>Body</Card>);
    expect(container.firstElementChild?.className).toContain('hover:border-foreground/25');
  });

  it('keeps the caller className', () => {
    const { container } = render(<Card className="w-96">Body</Card>);

    expect(container.firstElementChild?.className).toContain('w-96');
  });

  it('renders a title with the display face and the h3 step', () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByText('Title');

    expect(title.className).toContain('font-display');
    expect(title.className).toContain('text-h3');
  });

  it('accepts a custom aspect ratio', () => {
    render(
      <CardImage aspect="aspect-square">
        <img />
      </CardImage>,
    );

    expect(screen.getByRole('img').parentElement?.className).toContain('aspect-square');
  });
});
