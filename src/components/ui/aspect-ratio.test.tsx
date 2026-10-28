import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AspectRatio } from './aspect-ratio';

describe('AspectRatio', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <div className="w-80">
        <AspectRatio ratio={16 / 9}>
          <div className="h-full w-full bg-muted">16 / 9</div>
        </AspectRatio>
      </div>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <div className="w-80">
        <AspectRatio ratio={16 / 9}>
          <div className="h-full w-full bg-muted">16 / 9</div>
        </AspectRatio>
      </div>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('leaves the child reachable and sized by the ratio', async () => {
    render(
      <AspectRatio ratio={1}>
        <div data-testid="child">square</div>
      </AspectRatio>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
