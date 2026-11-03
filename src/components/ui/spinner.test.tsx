import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Spinner } from './spinner';

describe('Spinner', () => {
  it('is a status with a name, so it is announced instead of skipped', () => {
    render(<Spinner />);

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('takes a caller label when the context is more specific', () => {
    render(<Spinner aria-label="Saving" />);

    expect(screen.getByRole('status', { name: 'Saving' })).toBeInTheDocument();
  });

  it('lets the caller set the size', () => {
    render(<Spinner className="size-6" />);

    expect(screen.getByRole('status')).toHaveClass('size-6');
  });
});
