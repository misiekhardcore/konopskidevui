import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Switch } from './switch';

describe('Switch', () => {
  it('renders a composed instance', () => {
    const { container } = render(<Switch aria-label="Dark mode" />);

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(<Switch aria-label="Dark mode" />);

    expect(container.querySelector('[data-slot]')).not.toBeNull();
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
