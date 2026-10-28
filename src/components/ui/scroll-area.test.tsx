import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScrollArea } from './scroll-area';

describe('ScrollArea', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <ScrollArea className="h-32 w-64">
        <div>Scrollable content</div>
      </ScrollArea>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <ScrollArea className="h-32 w-64">
        <div>Scrollable content</div>
      </ScrollArea>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders its content and a scrollbar', async () => {
    render(
      <ScrollArea className="h-32 w-64">
        <div>Content</div>
      </ScrollArea>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
