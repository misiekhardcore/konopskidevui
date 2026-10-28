import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Calendar } from './calendar';

describe('Calendar', () => {
  it('renders a composed instance', () => {
    const { container } = render(<Calendar mode="single" />);

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(<Calendar mode="single" />);

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

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
});
