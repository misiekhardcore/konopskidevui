import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Separator } from './separator';

describe('Separator', () => {
  it('is a separator in the accessibility tree by default', () => {
    render(<Separator decorative={false} />);

    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('disappears from the accessibility tree when decorative', () => {
    render(<Separator decorative />);

    expect(screen.queryByRole('separator')).toBeNull();
  });

  it('publishes the orientation instead of encoding it in the width', () => {
    const { container, rerender } = render(<Separator decorative={false} />);

    expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', 'horizontal');

    rerender(<Separator decorative={false} orientation="vertical" />);

    expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', 'vertical');
    expect(container.querySelector('[data-slot="separator"]')).not.toBeNull();
  });
});
