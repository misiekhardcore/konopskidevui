import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Marker, MarkerIcon, MarkerContent } from './marker';

describe('Marker', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <Marker>
        <MarkerIcon>•</MarkerIcon>
        <MarkerContent>Marker</MarkerContent>
      </Marker>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <Marker>
        <MarkerIcon>•</MarkerIcon>
        <MarkerContent>Marker</MarkerContent>
      </Marker>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders every documented variant', () => {
    for (const value of ['default', 'border', 'separator'] as const) {
      const { unmount } = render(
        <Marker variant={value}>
          <MarkerContent>Marker</MarkerContent>
        </Marker>,
      );
      expect(document.body.textContent).toBeTruthy();
      unmount();
    }
  });
});
