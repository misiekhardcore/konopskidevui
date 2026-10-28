import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './button';
import { ButtonGroup } from './button-group';

describe('ButtonGroup', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <ButtonGroup>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
      </ButtonGroup>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <ButtonGroup>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
      </ButtonGroup>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('keeps every button individually focusable', async () => {
    render(
      <ButtonGroup>
        <Button>Day</Button>
        <Button>Week</Button>
      </ButtonGroup>,
    );

    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
