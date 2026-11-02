import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from './switch';

describe('Switch', () => {
  it('is a switch, not a checkbox, so its state is announced as on or off', () => {
    render(<Switch aria-label="Dark mode" />);

    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('publishes its size so the thumb can scale with the track', () => {
    render(<Switch aria-label="Dark mode" size="sm" />);

    expect(screen.getByRole('switch', { name: 'Dark mode' })).toHaveAttribute('data-size', 'sm');
  });

  it('toggles on click and reports the new state', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Dark mode" onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByRole('switch', { name: 'Dark mode' }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('does not change while disabled', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Dark mode" disabled onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByRole('switch', { name: 'Dark mode' }));

    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('toggles with the keyboard and exposes its state', async () => {
    render(<Switch aria-label="Dark mode" />);

    const control = screen.getByRole('switch', { name: 'Dark mode' });
    expect(control).toHaveAttribute('aria-checked', 'false');

    control.focus();
    await userEvent.keyboard('{Enter}');

    expect(control).toHaveAttribute('aria-checked', 'true');
  });
});
