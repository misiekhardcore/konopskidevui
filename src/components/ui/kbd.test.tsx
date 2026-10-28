import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Kbd } from './kbd';

describe('Kbd', () => {
  it('renders a composed instance', () => {
    const { container } = render(<Kbd>⌘</Kbd>);

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(<Kbd>⌘</Kbd>);

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders a <kbd> element', async () => {
    render(<Kbd>K</Kbd>);

    expect(screen.getByText('K').tagName).toBe('KBD');
  });
});
