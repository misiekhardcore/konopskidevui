import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { NativeSelect, NativeSelectOption } from './native-select';

describe('NativeSelect', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <NativeSelect defaultValue="a" aria-label="Sort">
        <NativeSelectOption value="a">Newest</NativeSelectOption>
        <NativeSelectOption value="b">Oldest</NativeSelectOption>
      </NativeSelect>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <NativeSelect defaultValue="a" aria-label="Sort">
        <NativeSelectOption value="a">Newest</NativeSelectOption>
        <NativeSelectOption value="b">Oldest</NativeSelectOption>
      </NativeSelect>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('keeps the native combobox role and selects an option', async () => {
    render(
      <NativeSelect aria-label="Sort" defaultValue="newest">
        <NativeSelectOption value="newest">Newest</NativeSelectOption>
        <NativeSelectOption value="oldest">Oldest</NativeSelectOption>
      </NativeSelect>,
    );

    const select = screen.getByRole('combobox', { name: 'Sort' });
    await userEvent.selectOptions(select, 'oldest');

    expect(select).toHaveValue('oldest');
  });
});
