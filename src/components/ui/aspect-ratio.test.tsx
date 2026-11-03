import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AspectRatio } from './aspect-ratio';

describe('AspectRatio', () => {
  it('keeps the child mounted inside a single box', () => {
    render(
      <AspectRatio ratio={1}>
        <div data-testid="child">square</div>
      </AspectRatio>,
    );

    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
    expect(child.parentElement).toHaveAttribute('data-slot', 'aspect-ratio');
  });

  it('publishes the ratio so the box can reserve its space', () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <div>video</div>
      </AspectRatio>,
    );

    // The ratio becomes a percentage padding on Radix's wrapper, so the height
    // follows the width without a media query or a JavaScript measurement.
    const wrapper = container.querySelector('[data-radix-aspect-ratio-wrapper]') as HTMLElement;
    expect(wrapper.style.paddingBottom).toBe('56.25%');
  });

  it('forwards its ref to the element that owns the box', () => {
    const ref = { current: null as HTMLDivElement | null };

    render(
      <AspectRatio ratio={4 / 3} ref={ref}>
        <div>media</div>
      </AspectRatio>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
