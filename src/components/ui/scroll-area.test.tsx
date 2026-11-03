import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScrollArea } from './scroll-area';

describe('ScrollArea', () => {
  it('renders its content and a scrollbar', async () => {
    render(
      <ScrollArea className="h-32 w-64">
        <div>Content</div>
      </ScrollArea>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('keeps the viewport reachable by keyboard', () => {
    const { container } = render(
      <ScrollArea className="h-32 w-64">
        <div>Content</div>
      </ScrollArea>,
    );

    const viewport = container.querySelector('[data-slot="scroll-area-viewport"]');

    expect(viewport).toHaveAttribute('tabindex', '0');
    expect(viewport).toHaveTextContent('Content');
  });
});
