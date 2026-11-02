import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('renders an empty placeholder, not text', () => {
    const { container } = render(<Skeleton className="h-4 w-1/2" />);

    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toBeEmptyDOMElement();
  });

  it('takes its size from the caller, because a bare skeleton is invisible', () => {
    const { container } = render(<Skeleton className="h-40 w-full" />);

    expect(container.querySelector('[data-slot="skeleton"]')).toHaveClass('h-40', 'w-full');
  });

  it('stays out of the accessibility tree: it stands in for content, it is not content', () => {
    const { container } = render(<Skeleton aria-hidden="true" />);

    expect(container.querySelector('[data-slot="skeleton"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
