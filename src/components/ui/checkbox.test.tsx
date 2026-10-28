import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('renders an unchecked checkbox by default', () => {
    render(<Checkbox aria-label="Newsletter" />);

    expect(screen.getByRole('checkbox', { name: 'Newsletter' })).not.toBeChecked();
  });

  it('starts checked when asked', () => {
    render(<Checkbox aria-label="Newsletter" defaultChecked />);

    expect(screen.getByRole('checkbox', { name: 'Newsletter' })).toBeChecked();
  });

  it('toggles on click and reports the change', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Newsletter" onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByRole('checkbox', { name: 'Newsletter' }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('checkbox', { name: 'Newsletter' })).toBeChecked();
  });

  it('toggles with the keyboard', async () => {
    render(<Checkbox aria-label="Newsletter" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Newsletter' });

    checkbox.focus();
    await userEvent.keyboard(' ');

    expect(checkbox).toBeChecked();
  });

  it('does not change while disabled', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Newsletter" disabled onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByRole('checkbox', { name: 'Newsletter' }));

    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('uses the house radius', () => {
    render(<Checkbox aria-label="Newsletter" />);

    expect(screen.getByRole('checkbox', { name: 'Newsletter' }).className).toContain('rounded-sm');
  });

  it('forwards a ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Checkbox aria-label="Newsletter" ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
