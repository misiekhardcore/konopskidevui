import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Progress } from './progress';

describe('Progress', () => {
  it('renders a composed instance', () => {
    const { container } = render(<Progress value={40} aria-label="Upload progress" />);

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(<Progress value={40} aria-label="Upload progress" />);

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('exposes its value to assistive tech', async () => {
    render(<Progress value={60} aria-label="Upload" />);

    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuenow', '60');
  });
});
