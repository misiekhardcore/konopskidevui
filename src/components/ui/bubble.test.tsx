import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Bubble, BubbleContent } from './bubble';

describe('Bubble', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <Bubble align="start">
        <BubbleContent>Hello</BubbleContent>
      </Bubble>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <Bubble align="start">
        <BubbleContent>Hello</BubbleContent>
      </Bubble>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders every documented variant', () => {
    for (const value of [
      'default',
      'muted',
      'tinted',
      'secondary',
      'outline',
      'ghost',
      'destructive',
    ] as const) {
      const { unmount } = render(
        <Bubble variant={value}>
          <BubbleContent>Hi</BubbleContent>
        </Bubble>,
      );
      expect(document.body.textContent).toBeTruthy();
      unmount();
    }
  });
});
