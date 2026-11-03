import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from './item';

describe('Item', () => {
  it('is a list item inside a list group', () => {
    render(
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>Design systems in practice</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>,
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toContainElement(
      screen.getByText('Design systems in practice'),
    );
  });

  it('publishes the variant and density the stylesheet switches on', () => {
    const { container } = render(
      <Item variant="outline" size="sm">
        <ItemContent>
          <ItemTitle>Row</ItemTitle>
        </ItemContent>
      </Item>,
    );

    const row = container.querySelector('[data-slot="item"]');
    expect(row).toHaveAttribute('data-variant', 'outline');
    expect(row).toHaveAttribute('data-size', 'sm');
  });

  it('lets the row be the link itself with asChild', () => {
    render(
      <Item asChild>
        <a href="#article">
          <ItemContent>
            <ItemTitle>Design systems in practice</ItemTitle>
            <ItemDescription>18 min read</ItemDescription>
          </ItemContent>
        </a>
      </Item>,
    );

    const link = screen.getByRole('link', { name: /Design systems in practice/ });
    expect(link.tagName).toBe('A');
    // With `asChild` the consumer's element keeps its own role, which is why the
    // group around it must not claim `role="list"` (see the AsLink story).
    expect(link).not.toHaveAttribute('role');
  });

  it('frames the media it is given', () => {
    const { container } = render(<ItemMedia variant="icon">📘</ItemMedia>);

    expect(container.querySelector('[data-slot="item-media"]')).toHaveAttribute(
      'data-variant',
      'icon',
    );
  });

  it('bands a row with a header and a footer, and collects its actions', () => {
    const { container } = render(
      <Item>
        <ItemHeader>Draft</ItemHeader>
        <ItemContent>
          <ItemTitle>An article</ItemTitle>
        </ItemContent>
        <ItemActions>
          <button type="button">Publish</button>
        </ItemActions>
        <ItemFooter>Updated today</ItemFooter>
      </Item>,
    );

    expect(container.querySelector('[data-slot="item-header"]')).toHaveTextContent('Draft');
    expect(container.querySelector('[data-slot="item-actions"]')).toContainElement(
      screen.getByRole('button', { name: 'Publish' }),
    );
    expect(container.querySelector('[data-slot="item-footer"]')).toHaveTextContent('Updated today');
  });
});
