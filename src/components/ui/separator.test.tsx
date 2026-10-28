import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Separator } from './separator';

describe('Separator', () => {
  it('renders a composed instance', () => {
    const { container } = render(<Separator />);

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(<Separator />);

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('is announced when it is not decorative', async () => {
    render(<Separator decorative={false} />);

    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});
