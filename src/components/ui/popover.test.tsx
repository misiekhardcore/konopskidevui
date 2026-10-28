import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Popover, PopoverContent, PopoverTrigger } from './popover';

describe('Popover', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Panel</PopoverContent>
      </Popover>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Panel</PopoverContent>
      </Popover>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('opens on click and closes on Escape', async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Panel content</PopoverContent>
      </Popover>,
    );

    await userEvent.click(screen.getByText('Open'));
    expect(await screen.findByText('Panel content')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText('Panel content')).not.toBeInTheDocument();
  });
});
