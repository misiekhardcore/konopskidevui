import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb';

function renderTrail() {
  return render(
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/articles">Articles</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Reading performance budgets</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  );
}

describe('Breadcrumb', () => {
  it('is a labelled navigation landmark', () => {
    renderTrail();

    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
  });

  it('marks the last crumb as the current page instead of linking it', () => {
    renderTrail();

    const current = screen.getByText('Reading performance budgets');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('aria-disabled', 'true');
    // A span with `role="link"`, not an anchor: it looks like a crumb and goes
    // nowhere, which is what the current page is.
    expect(current.tagName).toBe('SPAN');
    expect(current).not.toHaveAttribute('href');
  });

  it('keeps every earlier crumb a real URL', () => {
    renderTrail();

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Articles' })).toHaveAttribute('href', '/articles');
  });

  it('hides the ellipsis from the accessibility tree: it stands in for links, not text', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(container.querySelector('[data-slot="breadcrumb-ellipsis"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('swaps the default chevron for a custom separator', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Articles</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByText('/')).toHaveAttribute('role', 'presentation');
  });
});
