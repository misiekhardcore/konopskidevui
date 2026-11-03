import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

function renderSheet(props: React.ComponentProps<typeof SheetContent> = {}) {
  return render(
    <Sheet>
      <SheetTrigger>Open sheet</SheetTrigger>
      <SheetContent {...props}>
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Jump to a section.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>,
  );
}

describe('Sheet', () => {
  it('opens as a dialog named by its title', async () => {
    renderSheet();

    await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }));

    expect(await screen.findByRole('dialog')).toHaveAccessibleName('Navigation');
  });

  it('attaches to the edge it is given', async () => {
    renderSheet({ side: 'bottom' });

    await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('data-side', 'bottom');
  });

  it('closes on Escape', async () => {
    renderSheet();

    await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }));
    await screen.findByRole('dialog');

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes from inside, which is what a footer button needs', async () => {
    renderSheet();

    await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Done' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('drops the corner button when asked, keeping the close affordance in the body', async () => {
    renderSheet({ showCloseButton: false });

    await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog.querySelector('[data-slot="sheet-close"] .sr-only')).toBeNull();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });
});
