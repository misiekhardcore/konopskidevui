import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from './sheet';

describe('Sheet', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>Sheet description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <Sheet defaultOpen>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>Sheet description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('opens from the requested side', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent side="left">
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Pick a section.</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    const panel = await screen.findByRole('dialog');
    expect(panel.className).toContain('left-0');
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Pick a section.</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
