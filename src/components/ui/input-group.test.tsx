import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from './input-group';

import type * as React from 'react';

function renderGroup(props: React.ComponentProps<typeof InputGroup> = {}) {
  return render(
    <InputGroup {...props}>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="konopski.dev" aria-label="Site address" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Go</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>,
  );
}

describe('InputGroup', () => {
  it('exposes the composition as a single group around one control', () => {
    const { container } = renderGroup();

    // The root and each addon are `group`s, so the stylesheet's `has-*` hooks
    // need the outer one to be identifiable on its own.
    const group = container.querySelector('[data-slot="input-group"]');
    expect(group).toHaveAttribute('role', 'group');
    expect(screen.getByRole('textbox', { name: 'Site address' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('focuses the control when the addon itself is clicked', async () => {
    renderGroup();

    await userEvent.click(screen.getByText('https://'));

    expect(screen.getByRole('textbox', { name: 'Site address' })).toHaveFocus();
  });

  it('leaves focus alone when the click lands on a button inside the addon', async () => {
    const onClick = vi.fn();
    render(
      <InputGroup>
        <InputGroupInput aria-label="Site address" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={onClick}>Go</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Go' }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: 'Site address' })).not.toHaveFocus();
  });

  it('tells the stylesheet where each addon belongs', () => {
    renderGroup();

    const aligns = screen
      .getAllByRole('group')
      .flatMap((group) => [...group.querySelectorAll('[data-align]')])
      .map((addon) => addon.getAttribute('data-align'));

    expect(aligns).toEqual(['inline-start', 'inline-end']);
  });

  it('announces an optional field and drops the hint once the field is required', () => {
    const { rerender } = render(
      <InputGroup>
        <InputGroupInput placeholder="Handle" aria-label="Handle" />
      </InputGroup>,
    );

    expect(screen.getByRole('textbox', { name: 'Handle' })).toHaveAttribute(
      'placeholder',
      'Handle (optional)',
    );

    rerender(
      <InputGroup>
        <InputGroupInput placeholder="Handle" aria-label="Handle" required />
      </InputGroup>,
    );

    expect(screen.getByRole('textbox', { name: 'Handle' })).toHaveAttribute(
      'placeholder',
      'Handle',
    );
  });

  it('marks the control invalid when the field is, so the group can paint the border', () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Site address" aria-invalid="true" />
      </InputGroup>,
    );

    const control = screen.getByRole('textbox', { name: 'Site address' });
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toHaveAttribute('data-slot', 'input-group-control');
  });

  it('renders a textarea instead of an input in the textarea variant', () => {
    render(
      <InputGroup>
        <InputGroupTextarea aria-label="Reply" />
      </InputGroup>,
    );

    expect(screen.getByRole('textbox', { name: 'Reply' }).tagName).toBe('TEXTAREA');
  });

  it('keeps the control disabled when the group is', () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Site address" disabled />
      </InputGroup>,
    );

    expect(screen.getByRole('textbox', { name: 'Site address' })).toBeDisabled();
  });
});
