import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from './bubble';

describe('Bubble', () => {
  it('publishes the side of the thread it sits on', () => {
    const { container, rerender } = render(<Bubble>Hello</Bubble>);

    expect(container.querySelector('[data-slot="bubble"]')).toHaveAttribute('data-align', 'start');

    rerender(<Bubble align="end">Hello</Bubble>);

    expect(container.querySelector('[data-slot="bubble"]')).toHaveAttribute('data-align', 'end');
  });

  it('paints the variant', () => {
    const { container, rerender } = render(<Bubble>Hello</Bubble>);

    expect(container.querySelector('[data-slot="bubble"]')).toHaveAttribute(
      'data-variant',
      'default',
    );

    rerender(<Bubble variant="destructive">Hello</Bubble>);

    expect(container.querySelector('[data-slot="bubble"]')).toHaveAttribute(
      'data-variant',
      'destructive',
    );
  });

  it('keeps the copy inside the bubble it belongs to', () => {
    render(
      <BubbleGroup>
        <Bubble>
          <BubbleContent>Did you get a chance to look at the PR?</BubbleContent>
        </Bubble>
      </BubbleGroup>,
    );

    expect(screen.getByText('Did you get a chance to look at the PR?')).toBeInTheDocument();
  });

  it('lets the content be the interactive element with asChild', () => {
    render(
      <Bubble>
        <BubbleContent asChild>
          <a href="#thread">Replying to Ada</a>
        </BubbleContent>
      </Bubble>,
    );

    expect(screen.getByRole('link', { name: 'Replying to Ada' })).toHaveAttribute(
      'href',
      '#thread',
    );
  });

  it('hangs reactions off the edge it is given', () => {
    const { container } = render(
      <Bubble>
        <BubbleContent>Looks right.</BubbleContent>
        <BubbleReactions side="top" align="start">
          👍 2
        </BubbleReactions>
      </Bubble>,
    );

    const reactions = container.querySelector('[data-slot="bubble-reactions"]');
    expect(reactions).toHaveAttribute('data-side', 'top');
    expect(reactions).toHaveAttribute('data-align', 'start');
  });
});
