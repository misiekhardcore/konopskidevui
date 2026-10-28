import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, it } from 'vitest';

import { Button } from './button';
import { Toaster } from './sonner';

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

  it('renders the requested theme on the toaster', async () => {
    render(<Toaster theme="dark" />);
    toast('Theme check');

    expect(await screen.findByRole('list')).toHaveAttribute('data-sonner-theme', 'dark');
  });

  it('keeps a caller className alongside the group class', async () => {
    render(<Toaster className="custom-toaster" />);
    toast('Class check');

    const list = await screen.findByRole('list');

    expect(list.className).toContain('toaster');
    expect(list.className).toContain('custom-toaster');
  });
});
