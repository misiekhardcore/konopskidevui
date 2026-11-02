import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Progress } from './progress';

describe('Progress', () => {
  it('exposes the value on a progressbar', () => {
    render(<Progress value={40} aria-label="Upload progress" />);

    const bar = screen.getByRole('progressbar', { name: 'Upload progress' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('measures against max when it is not 100', () => {
    render(<Progress value={3} max={12} aria-label="Onboarding steps" />);

    expect(screen.getByRole('progressbar', { name: 'Onboarding steps' })).toHaveAttribute(
      'aria-valuemax',
      '12',
    );
  });

  it('drops the fill and the value when indeterminate', () => {
    const { container } = render(<Progress value={null} aria-label="Upload progress" />);

    const bar = screen.getByRole('progressbar', { name: 'Upload progress' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(container.querySelector('[data-slot="progress-indicator"]')).toHaveStyle({
      transform: 'translateX(-100%)',
    });
  });

  it('moves the fill with the value', () => {
    const { container, rerender } = render(<Progress value={25} aria-label="Upload progress" />);

    expect(container.querySelector('[data-slot="progress-indicator"]')).toHaveStyle({
      transform: 'translateX(-75%)',
    });

    rerender(<Progress value={75} aria-label="Upload progress" />);

    expect(container.querySelector('[data-slot="progress-indicator"]')).toHaveStyle({
      transform: 'translateX(-25%)',
    });
  });
});
