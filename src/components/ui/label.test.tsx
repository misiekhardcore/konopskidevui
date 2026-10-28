import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Label } from './label';

describe('Label', () => {
  it('renders a composed instance', () => {
    const { container } = render(<Label htmlFor="title">Article title</Label>);

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(<Label htmlFor="title">Article title</Label>);

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('associates with the control it names', async () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});
