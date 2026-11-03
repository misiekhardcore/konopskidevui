import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group';

describe('ButtonGroup', () => {
  it('exposes the group as one control with its orientation', () => {
    const { container } = render(
      <ButtonGroup>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
      </ButtonGroup>,
    );

    const group = container.querySelector('[data-slot="button-group"]');
    expect(group).toHaveAttribute('role', 'group');
    expect(group).toHaveAttribute('data-orientation', 'horizontal');
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('stacks vertically when asked', () => {
    const { container } = render(
      <ButtonGroup orientation="vertical">
        <Button variant="outline">Day</Button>
      </ButtonGroup>,
    );

    expect(container.querySelector('[data-slot="button-group"]')).toHaveAttribute(
      'data-orientation',
      'vertical',
    );
  });

  it('lets the text half be a link', () => {
    render(
      <ButtonGroup>
        <ButtonGroupText asChild>
          <a href="https://konopski.dev">konopski.dev</a>
        </ButtonGroupText>
        <Button variant="outline">Copy</Button>
      </ButtonGroup>,
    );

    expect(screen.getByRole('link', { name: 'konopski.dev' })).toHaveAttribute(
      'href',
      'https://konopski.dev',
    );
  });

  it('draws the separator on the axis the group does not use', () => {
    const { container } = render(
      <ButtonGroup>
        <Button variant="outline">Save</Button>
        <ButtonGroupSeparator orientation="vertical" />
        <Button variant="outline">Publish</Button>
      </ButtonGroup>,
    );

    const separator = container.querySelector('[data-slot="button-group-separator"]');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });
});
