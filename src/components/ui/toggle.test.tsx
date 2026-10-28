import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Toggle } from './toggle';

describe('Toggle', () => {
  it('renders a composed instance', () => {
    const { container } = render(<Toggle aria-label="Toggle bold">B</Toggle>);

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(<Toggle aria-label="Toggle bold">B</Toggle>);

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders every documented variant', () => {
    for (const value of ['default', 'outline'] as const) {
      const { unmount } = render(<Toggle variant={value}>B</Toggle>);
      expect(document.body.textContent).toBeTruthy();
      unmount();
    }
  });

  it('toggles aria-pressed on click', async () => {
    render(<Toggle aria-label="Bold">B</Toggle>);

    const button = screen.getByRole('button', { name: 'Bold' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});
