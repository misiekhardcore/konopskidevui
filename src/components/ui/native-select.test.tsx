import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from './native-select';

function renderSelect(props: React.ComponentProps<typeof NativeSelect> = {}) {
  const onChange = vi.fn();

  render(
    <NativeSelect aria-label="Sort" defaultValue="newest" onChange={onChange} {...props}>
      <NativeSelectOption value="newest">Newest</NativeSelectOption>
      <NativeSelectOption value="oldest">Oldest</NativeSelectOption>
      <NativeSelectOptGroup label="Alphabetical">
        <NativeSelectOption value="az">A → Z</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>,
  );

  return { onChange };
}

describe('NativeSelect', () => {
  it('is a real select, so the platform keeps its combobox semantics', () => {
    renderSelect();

    const select = screen.getByRole('combobox', { name: 'Sort' });
    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveValue('newest');
  });

  it('reports the chosen option to the form', async () => {
    const { onChange } = renderSelect();

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Sort' }), 'oldest');

    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole('combobox', { name: 'Sort' })).toHaveValue('oldest');
  });

  it('groups options under a real optgroup', () => {
    renderSelect();

    const group = screen.getByRole('group', { name: 'Alphabetical' });
    expect(group.tagName).toBe('OPTGROUP');
  });

  it('publishes the size on the wrapper and the control', () => {
    const { container } = render(
      <NativeSelect aria-label="Sort" size="sm">
        <NativeSelectOption value="a">A</NativeSelectOption>
      </NativeSelect>,
    );

    expect(container.querySelector('[data-slot="native-select-wrapper"]')).toHaveAttribute(
      'data-size',
      'sm',
    );
    expect(screen.getByRole('combobox', { name: 'Sort' })).toHaveAttribute('data-size', 'sm');
  });

  it('stays unusable when disabled', async () => {
    renderSelect({ disabled: true });

    const select = screen.getByRole('combobox', { name: 'Sort' });
    expect(select).toBeDisabled();

    await userEvent.selectOptions(select, 'oldest');
    expect(select).toHaveValue('newest');
  });

  it('leaves the invalid treatment to the native control', () => {
    renderSelect({ 'aria-invalid': true });

    expect(screen.getByRole('combobox', { name: 'Sort' })).toHaveAttribute('aria-invalid', 'true');
  });
});
