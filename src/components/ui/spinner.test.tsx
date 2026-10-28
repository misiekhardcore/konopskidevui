import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Spinner } from './spinner';

describe('Spinner', () => {
  it('renders a composed instance', () => {
    const { container } = render(<Spinner />);

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(<Spinner />);

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('exposes a status role for screen readers', async () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
