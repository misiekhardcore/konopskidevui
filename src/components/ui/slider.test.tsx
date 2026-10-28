import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Slider } from './slider';

describe('Slider', () => {
  it('renders a slider with its value and bounds exposed', () => {
    render(<Slider defaultValue={[40]} min={0} max={100} aria-label="Font size" />);

    const slider = screen.getByRole('slider', { name: 'Font size' });

    expect(slider).toHaveAttribute('aria-valuenow', '40');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
  });

  it('steps with the arrow keys', async () => {
    render(<Slider defaultValue={[40]} step={5} aria-label="Font size" />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(slider).toHaveAttribute('aria-valuenow', '45');
  });

  it('jumps to the bounds with Home and End', async () => {
    render(<Slider defaultValue={[40]} min={10} max={90} aria-label="Font size" />);

    const slider = screen.getByRole('slider');
    slider.focus();

    await userEvent.keyboard('{Home}');
    expect(slider).toHaveAttribute('aria-valuenow', '10');

    await userEvent.keyboard('{End}');
    expect(slider).toHaveAttribute('aria-valuenow', '90');
  });

  it('renders two thumbs for a range', () => {
    render(<Slider defaultValue={[20, 80]} aria-label="Price" />);

    expect(screen.getAllByRole('slider')).toHaveLength(2);
  });

  it('names each thumb separately', () => {
    render(<Slider defaultValue={[20, 80]} thumbLabels={['Minimum price', 'Maximum price']} />);

    expect(screen.getByRole('slider', { name: 'Minimum price' })).toHaveAttribute(
      'aria-valuenow',
      '20',
    );
    expect(screen.getByRole('slider', { name: 'Maximum price' })).toHaveAttribute(
      'aria-valuenow',
      '80',
    );
  });

  it('does not respond while disabled', async () => {
    render(<Slider defaultValue={[40]} disabled aria-label="Font size" />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('data-disabled');

    slider.focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(slider).toHaveAttribute('aria-valuenow', '40');
  });
});
