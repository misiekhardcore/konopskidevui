import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('renders a composed instance', () => {
    const { container } = render(<Skeleton className="h-10 w-10" />);

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(<Skeleton className="h-10 w-10" />);

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('pulses with the muted surface and merges its sizing', () => {
    const { container } = render(<Skeleton className="h-4 w-4" />);
    const skeleton = container.firstElementChild;

    expect(skeleton?.className).toContain('animate-pulse');
    expect(skeleton?.className).toContain('bg-muted');
    expect(skeleton?.className).toContain('h-4');
    expect(skeleton?.className).toContain('w-4');
  });
});
