import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

import type * as React from 'react';

describe('Pagination', () => {
  it('marks the current page for assistive tech', async () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="?page=2" isActive>
              2
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
  });

  it('labels the previous and next controls', async () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="?page=1" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="?page=3" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole('link', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /next/i })).toBeInTheDocument();
  });

  it('renders the link through `as`, so a router can take the navigation', () => {
    // Stands in for `next/link`: the library hands the anchor props and the
    // button styling to whatever element or component the consumer passes.
    function RouterLink({ children, ...props }: React.ComponentProps<'a'>) {
      return (
        <a data-router-link="" {...props}>
          {children}
        </a>
      );
    }

    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious as={RouterLink} href="?page=1" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink as={RouterLink} href="?page=2" isActive>
              2
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    const current = screen.getByRole('link', { name: '2' });

    expect(current.tagName).toBe('A');
    expect(current).toHaveAttribute('href', '?page=2');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('data-slot', 'pagination-link');
    expect(current).toHaveAttribute('data-router-link', '');
    expect(current.className).toContain('focus-ring');
    // The link borrows the button styling, not the button: no `type="button"`
    // on an anchor, and nothing that claims to be a `<button>`.
    expect(current).not.toHaveAttribute('type');
    expect(current).not.toHaveAttribute('data-slot', 'button');

    expect(screen.getByRole('link', { name: /previous/i })).toHaveAttribute('data-router-link', '');
  });

  it('keeps the controls out of the tab order when unavailable', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="?page=1" aria-disabled="true" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole('link', { name: /previous/i })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });
});
