import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

function renderSelect(props: { disabled?: boolean; onValueChange?: (value: string) => void } = {}) {
  return render(
    <Select defaultValue="newest" {...props}>
      <SelectTrigger aria-label="Sort by">
        <SelectValue placeholder="Pick a sort order" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest first</SelectItem>
        <SelectItem value="oldest">Oldest first</SelectItem>
      </SelectContent>
    </Select>,
  );
}

describe('Select', () => {
  it('shows the current value on a combobox trigger', () => {
    renderSelect();

    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent('Newest first');
  });

  it('opens the listbox and picks an option', async () => {
    const onValueChange = vi.fn();
    renderSelect({ onValueChange });

    await userEvent.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Oldest first' }));

    expect(onValueChange).toHaveBeenCalledWith('oldest');
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent('Oldest first');
  });

  it('moves through options with the keyboard', async () => {
    renderSelect();

    await userEvent.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent('Oldest first');
  });

  it('can be disabled', () => {
    renderSelect({ disabled: true });

    expect(screen.getByRole('combobox', { name: 'Sort by' })).toBeDisabled();
  });

  it('uses the house control treatment on the trigger', () => {
    renderSelect();

    const trigger = screen.getByRole('combobox', { name: 'Sort by' });
    expect(trigger.className).toContain('rounded-sm');
    expect(trigger.className).toContain('focus-ring');
    expect(trigger.className).toContain('border-input');
  });

  it('publishes the trigger size so the row height can follow it', () => {
    render(
      <Select defaultValue="newest">
        <SelectTrigger aria-label="Sort by" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveAttribute('data-size', 'sm');
  });

  it('shows the placeholder until a value is chosen', async () => {
    render(
      <Select>
        <SelectTrigger aria-label="Sort by">
          <SelectValue placeholder="Pick a sort order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole('combobox', { name: 'Sort by' });
    expect(trigger).toHaveTextContent('Pick a sort order');

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: 'Newest first' }));

    expect(trigger).toHaveTextContent('Newest first');
  });

  it('defaults the trigger to the full-height row', () => {
    render(
      <Select defaultValue="newest">
        <SelectTrigger aria-label="Sort by">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveAttribute(
      'data-size',
      'default',
    );
  });

  it('anchors the popup to the trigger when it is asked to float', async () => {
    render(
      <Select defaultValue="newest">
        <SelectTrigger aria-label="Sort by">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          <SelectItem value="newest">Newest first</SelectItem>
        </SelectContent>
      </Select>,
    );

    await userEvent.click(screen.getByRole('combobox', { name: 'Sort by' }));
    const content = await screen.findByRole('listbox');

    expect(content).toHaveAttribute('data-align-trigger', 'false');
    expect(document.querySelector('[data-slot="select-content"]')).toHaveAttribute(
      'data-align-trigger',
      'false',
    );
    expect(document.querySelector('[data-slot="select-content"]')?.className).toContain(
      'translate-y-1',
    );
  });

  it('closes the list on Escape without changing the value', async () => {
    renderSelect();

    await userEvent.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await screen.findByRole('option', { name: 'Oldest first' });

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent('Newest first');
  });
});
