import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription } from './item';

describe('Item', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <Item>
        <ItemMedia variant="default">📘</ItemMedia>
        <ItemContent>
          <ItemTitle>Design systems in practice</ItemTitle>
          <ItemDescription>18 min read</ItemDescription>
        </ItemContent>
      </Item>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <Item>
        <ItemMedia variant="default">📘</ItemMedia>
        <ItemContent>
          <ItemTitle>Design systems in practice</ItemTitle>
          <ItemDescription>18 min read</ItemDescription>
        </ItemContent>
      </Item>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders every documented variant', () => {
    for (const value of ['default', 'outline', 'muted'] as const) {
      const { unmount } = render(
        <Item variant={value}>
          <ItemContent>
            <ItemTitle>Row</ItemTitle>
          </ItemContent>
        </Item>,
      );
      expect(document.body.textContent).toBeTruthy();
      unmount();
    }
  });

  it('renders as a link when asChild is set', async () => {
    render(
      <Item asChild>
        <a href="/articles/one">
          <ItemContent>
            <ItemTitle>One</ItemTitle>
          </ItemContent>
        </a>
      </Item>,
    );

    expect(screen.getByRole('link', { name: 'One' })).toHaveAttribute('href', '/articles/one');
  });
});
