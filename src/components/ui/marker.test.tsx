import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Marker, MarkerContent, MarkerIcon } from './marker';

describe('Marker', () => {
  it('renders its icon and content inline', () => {
    render(
      <Marker>
        <MarkerIcon>•</MarkerIcon>
        <MarkerContent>System prompt</MarkerContent>
      </Marker>,
    );

    expect(screen.getByText('System prompt')).toBeInTheDocument();
    expect(screen.getByText('•')).toBeInTheDocument();
  });

  it('publishes the variant the stylesheet switches on', () => {
    const { container, rerender } = render(<Marker>Context loaded</Marker>);

    expect(container.firstElementChild).toHaveAttribute('data-variant', 'default');

    rerender(<Marker variant="border">Context loaded</Marker>);

    expect(container.firstElementChild).toHaveAttribute('data-variant', 'border');
  });

  it('becomes the link itself with asChild', () => {
    render(
      <Marker asChild>
        <a href="#tool-result">
          <MarkerContent>Tool result</MarkerContent>
        </a>
      </Marker>,
    );

    expect(screen.getByRole('link', { name: 'Tool result' })).toHaveAttribute(
      'href',
      '#tool-result',
    );
  });
});
