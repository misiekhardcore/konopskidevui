import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from './empty';

describe('Empty', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No articles yet</EmptyTitle>
          <EmptyDescription>Write your first draft to see it here.</EmptyDescription>
        </EmptyHeader>
      </Empty>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No articles yet</EmptyTitle>
          <EmptyDescription>Write your first draft to see it here.</EmptyDescription>
        </EmptyHeader>
      </Empty>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders its title, description and action', async () => {
    render(
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Nothing here</EmptyTitle>
          <EmptyDescription>Try another filter.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>Reset</EmptyContent>
      </Empty>,
    );

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Try another filter.')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });
});
