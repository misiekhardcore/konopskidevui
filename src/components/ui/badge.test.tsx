import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './badge';

describe('Badge', () => {
  it('renders a composed instance', () => {
    const { container } = render(<Badge>Published</Badge>);

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(<Badge>Published</Badge>);

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders every documented variant', () => {
    for (const value of [
      'default',
      'secondary',
      'destructive',
      'outline',
      'ghost',
      'link',
    ] as const) {
      const { unmount } = render(<Badge variant={value}>Badge</Badge>);
      expect(document.body.textContent).toBeTruthy();
      unmount();
    }
  });

  it('renders as a link when asChild is set', async () => {
    render(
      <Badge asChild>
        <a href="/tags/typescript">TypeScript</a>
      </Badge>,
    );

    expect(screen.getByRole('link', { name: 'TypeScript' })).toHaveAttribute(
      'href',
      '/tags/typescript',
    );
  });
});
