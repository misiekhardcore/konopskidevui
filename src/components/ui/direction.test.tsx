import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DirectionProvider, useDirection } from './direction';

function DirectionProbe() {
  return <span>{useDirection()}</span>;
}

describe('Direction', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <div>Right to left content</div>
      </DirectionProvider>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('hands its direction to descendants', () => {
    render(
      <DirectionProvider dir="rtl">
        <DirectionProbe />
      </DirectionProvider>,
    );

    expect(screen.getByText('rtl')).toBeInTheDocument();
  });

  it('accepts the deprecated direction alias', () => {
    render(
      <DirectionProvider direction="rtl">
        <DirectionProbe />
      </DirectionProvider>,
    );

    expect(screen.getByText('rtl')).toBeInTheDocument();
  });
});
