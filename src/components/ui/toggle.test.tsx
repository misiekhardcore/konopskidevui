import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Toggle } from './toggle';

describe('Toggle', () => {
  it('is a button with aria-pressed, not a checkbox', () => {
    render(<Toggle aria-label="Bold">B</Toggle>);

    const toggle = screen.getByRole('button', { name: 'Bold' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('flips the pressed state and reports it', async () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Bold' }));

    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('starts pressed when asked', () => {
    render(
      <Toggle aria-label="Bold" defaultPressed>
        B
      </Toggle>,
    );

    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
  });

  it.each([
    ['sm', 'h-8'],
    ['default', 'h-10'],
    ['lg', 'h-12'],
  ] as const)('renders the %s size on the house scale', (size, expectedClass) => {
    render(
      <Toggle aria-label="Bold" size={size}>
        B
      </Toggle>,
    );

    expect(screen.getByRole('button', { name: 'Bold' })).toHaveClass(expectedClass);
  });

  it('does not change while disabled', async () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle aria-label="Bold" disabled onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Bold' }));

    expect(onPressedChange).not.toHaveBeenCalled();
  });
});
