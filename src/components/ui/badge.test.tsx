import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './badge';

describe('Badge', () => {
  it('is an inline span, so it never breaks the line it annotates', () => {
    render(<Badge>Published</Badge>);

    expect(screen.getByText('Published').tagName).toBe('SPAN');
  });

  it('paints the semantic variant', () => {
    const { rerender } = render(<Badge>Draft</Badge>);
    const badge = screen.getByText('Draft');

    expect(badge.className).toContain('bg-primary');

    rerender(<Badge variant="destructive">Failed</Badge>);

    expect(screen.getByText('Failed').className).toContain('text-destructive');
  });

  it('draws the outline with no fill', () => {
    render(<Badge variant="outline">Archived</Badge>);
    const badge = screen.getByText('Archived');

    expect(badge.className).toContain('border-border');
    expect(badge.className).toContain('bg-transparent');
  });

  it('renders the child instead of a span with asChild', () => {
    render(
      <Badge asChild variant="tag">
        <a href="#typescript">TypeScript</a>
      </Badge>,
    );

    const link = screen.getByRole('link', { name: 'TypeScript' });
    expect(link.tagName).toBe('A');
    expect(link.className).toContain('rounded-sm');
  });
});
