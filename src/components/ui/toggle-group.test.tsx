import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ToggleGroup, ToggleGroupItem } from './toggle-group';

function renderSingle() {
  return render(
    <ToggleGroup type="single" defaultValue="left" aria-label="Alignment">
      <ToggleGroupItem value="left" aria-label="Left">
        L
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right">
        R
      </ToggleGroupItem>
    </ToggleGroup>,
  );
}

describe('ToggleGroup', () => {
  it('marks the default item as checked in single mode', () => {
    renderSingle();

    expect(screen.getByRole('radio', { name: 'Left' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Right' })).toHaveAttribute('aria-checked', 'false');
  });

  it('selects the clicked item in single mode', async () => {
    renderSingle();

    await userEvent.click(screen.getByRole('radio', { name: 'Right' }));

    expect(screen.getByRole('radio', { name: 'Right' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Left' })).toHaveAttribute('aria-checked', 'false');
  });

  it('moves focus with arrow keys in single mode', async () => {
    renderSingle();

    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Left' })).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');

    expect(screen.getByRole('radio', { name: 'Right' })).toHaveFocus();
  });

  it('keeps several items pressed in multiple mode', async () => {
    render(
      <ToggleGroup type="multiple" defaultValue={['left']} aria-label="Formatting">
        <ToggleGroupItem value="left" aria-label="Left">
          L
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Right">
          R
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Right' }));

    expect(screen.getByRole('button', { name: 'Left' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Right' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders one item per entry', () => {
    renderSingle();

    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });
});
