import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DirectionProvider, useDirection } from './direction';

function DirectionProbe() {
  const dir = useDirection();
  return <span>{dir}</span>;
}

describe('DirectionProvider', () => {
  it('publishes the direction primitives read through the hook', () => {
    render(
      <DirectionProvider dir="rtl">
        <DirectionProbe />
      </DirectionProvider>,
    );

    expect(screen.getByText('rtl')).toBeInTheDocument();
  });

  it('defaults to left-to-right', () => {
    render(
      <DirectionProvider>
        <DirectionProbe />
      </DirectionProvider>,
    );

    expect(screen.getByText('ltr')).toBeInTheDocument();
  });

  it('still accepts the deprecated direction prop', () => {
    render(
      <DirectionProvider direction="rtl">
        <DirectionProbe />
      </DirectionProvider>,
    );

    expect(screen.getByText('rtl')).toBeInTheDocument();
  });

  it('prefers dir when both are passed', () => {
    render(
      <DirectionProvider dir="rtl" direction="ltr">
        <DirectionProbe />
      </DirectionProvider>,
    );

    expect(screen.getByText('rtl')).toBeInTheDocument();
  });
});
