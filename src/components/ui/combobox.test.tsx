import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from './combobox';

const frameworks = ['Next.js', 'SvelteKit', 'Nuxt'];

function renderCombobox() {
  return render(
    <Combobox items={frameworks}>
      <ComboboxInput placeholder="Select a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  );
}

describe('Combobox', () => {
  it('renders a text input for filtering', () => {
    renderCombobox();

    expect(screen.getByPlaceholderText('Select a framework (optional)')).toBeInTheDocument();
  });

  it('opens the list and shows an empty state for a miss', async () => {
    renderCombobox();

    await userEvent.click(screen.getByPlaceholderText('Select a framework (optional)'));
    await userEvent.type(screen.getByPlaceholderText('Select a framework (optional)'), 'zzz');

    expect(await screen.findByText('No frameworks found.')).toBeInTheDocument();
  });

  it('filters the options as the user types', async () => {
    renderCombobox();
    const input = screen.getByPlaceholderText('Select a framework (optional)');

    await userEvent.click(input);
    await userEvent.type(input, 'next');

    expect(await screen.findByText('Next.js')).toBeInTheDocument();
    expect(screen.queryByText('Nuxt')).not.toBeInTheDocument();
  });

  it('writes the chosen option into the input', async () => {
    renderCombobox();
    const input = screen.getByPlaceholderText('Select a framework (optional)');

    await userEvent.click(input);
    await userEvent.click(await screen.findByText('SvelteKit'));

    expect(screen.getByPlaceholderText('Select a framework (optional)')).toHaveValue('SvelteKit');
  });
});
