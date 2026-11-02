import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Calendar } from './calendar';

describe('Calendar', () => {
  it('renders a grid of days', async () => {
    render(<Calendar mode="single" defaultMonth={new Date(2026, 9, 1)} />);

    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByText('October 2026')).toBeInTheDocument();
  });

  it('selects a day on click', async () => {
    const onSelect = vi.fn();
    render(<Calendar mode="single" defaultMonth={new Date(2026, 9, 1)} onSelect={onSelect} />);

    await userEvent.click(screen.getByText('15'));

    expect(onSelect).toHaveBeenCalled();
  });

  it('moves to the next month from the navigation button', async () => {
    render(<Calendar mode="single" defaultMonth={new Date(2026, 9, 1)} />);

    await userEvent.click(screen.getByRole('button', { name: /next month/i }));

    expect(screen.getByText('November 2026')).toBeInTheDocument();
  });

  it('disables the days the caller rules out', () => {
    render(
      <Calendar
        mode="single"
        defaultMonth={new Date(2026, 9, 1)}
        disabled={{ dayOfWeek: [0, 6] }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Saturday, October 3rd, 2026' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Friday, October 2nd, 2026' })).toBeEnabled();
  });
});
