import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './empty';

describe('Empty', () => {
  it('says what is missing and offers the next step', () => {
    render(
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">📄</EmptyMedia>
          <EmptyTitle>No articles yet</EmptyTitle>
          <EmptyDescription>Write your first draft to see it here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <button type="button">New article</button>
        </EmptyContent>
      </Empty>,
    );

    expect(screen.getByText('No articles yet')).toBeInTheDocument();
    expect(screen.getByText('Write your first draft to see it here.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New article' })).toBeInTheDocument();
  });

  it('publishes the media variant so the tile can be drawn around it', () => {
    const { container } = render(
      <EmptyMedia variant="icon">📄</EmptyMedia>,
    );

    expect(container.querySelector('[data-slot="empty-icon"]')).toHaveAttribute(
      'data-variant',
      'icon',
    );
  });

  it('keeps the header a single labelled group', () => {
    const { container } = render(
      <EmptyHeader>
        <EmptyTitle>No results</EmptyTitle>
        <EmptyDescription>Try a shorter query.</EmptyDescription>
      </EmptyHeader>,
    );

    const header = container.querySelector('[data-slot="empty-header"]');
    expect(header).toContainElement(screen.getByText('No results'));
    expect(header).toContainElement(screen.getByText('Try a shorter query.'));
  });
});
