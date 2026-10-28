import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { RadioGroup, RadioGroupItem } from './radio-group';

describe('RadioGroup', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" aria-label="Option A" />
        <RadioGroupItem value="b" aria-label="Option B" />
      </RadioGroup>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" aria-label="Option A" />
        <RadioGroupItem value="b" aria-label="Option B" />
      </RadioGroup>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('moves focus with the arrow keys', async () => {
    render(
      <RadioGroup defaultValue="monthly" aria-label="Billing">
        <RadioGroupItem value="monthly" aria-label="Monthly" />
        <RadioGroupItem value="yearly" aria-label="Yearly" />
      </RadioGroup>,
    );

    await userEvent.tab();
    expect(screen.getByLabelText('Monthly')).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByLabelText('Yearly')).toHaveFocus();
  });

  it('selects the clicked item', async () => {
    render(
      <RadioGroup defaultValue="monthly" aria-label="Billing">
        <RadioGroupItem value="monthly" aria-label="Monthly" />
        <RadioGroupItem value="yearly" aria-label="Yearly" />
      </RadioGroup>,
    );

    await userEvent.click(screen.getByLabelText('Yearly'));

    expect(screen.getByLabelText('Yearly')).toBeChecked();
    expect(screen.getByLabelText('Monthly')).not.toBeChecked();
  });
});
