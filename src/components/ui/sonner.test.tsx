import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Button } from './button';
import { Toaster, toast } from './sonner';

// Sonner renders its list element only once at least one toast is queued.
describe('Toaster', () => {
  it('renders the notification region without any toast', () => {
    render(<Toaster />);

    const region = screen.getByRole('region', { name: /notifications/i });

    expect(region.querySelector('[data-sonner-toast]')).toBeNull();
  });

  it('announces a toast raised from a button', async () => {
    render(
      <>
        <Toaster />
        <Button onClick={() => toast.success('Article published')}>Publish</Button>
      </>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));

    expect(await screen.findByText('Article published')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /notifications/i })).toBeInTheDocument();
  });

  it('follows the page tokens by default', async () => {
    render(<Toaster />);
    toast('Page theme');

    const list = await screen.findByRole('list');

    expect(list).toHaveClass('toaster-page');
    expect(list.style.getPropertyValue('--normal-bg')).toBe('var(--popover)');
    expect(list.style.getPropertyValue('--normal-text')).toBe('var(--popover-foreground)');
    expect(list.style.getPropertyValue('--normal-border')).toBe('var(--border)');
    expect(list.style.getPropertyValue('--gray11')).toBe('var(--muted-foreground)');
  });

  it('opts out of the page skin when a theme is passed', async () => {
    render(<Toaster theme="dark" />);
    toast('Native palette');

    const list = await screen.findByRole('list');

    expect(list).not.toHaveClass('toaster-page');
    expect(list).toHaveAttribute('data-sonner-theme', 'dark');
    expect(list.style.getPropertyValue('--normal-bg')).toBe('');
  });

  it('keeps a caller className alongside the group class', async () => {
    render(<Toaster className="custom-toaster" />);
    toast('Class check');

    const list = await screen.findByRole('list');

    expect(list.className).toContain('toaster');
    expect(list.className).toContain('custom-toaster');
  });
});
