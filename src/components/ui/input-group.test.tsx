import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput } from './input-group';

describe('InputGroup', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupInput placeholder="Search" />
      </InputGroup>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupInput placeholder="Search" />
      </InputGroup>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('keeps the input reachable through its own slot', async () => {
    render(
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="handle" />
      </InputGroup>,
    );

    expect(screen.getByPlaceholderText('handle (optional)')).toBeInTheDocument();
  });
});
