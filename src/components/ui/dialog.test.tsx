import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

function renderDialog(props: { showCloseButton?: boolean } = {}) {
  return render(
    <Dialog>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogContent {...props}>
        <DialogHeader>
          <DialogTitle>Rename article</DialogTitle>
          <DialogDescription>The URL stays the same.</DialogDescription>
        </DialogHeader>
        <DialogFooter>Footer content</DialogFooter>
      </DialogContent>
    </Dialog>,
  );
}

describe('Dialog', () => {
  it('renders only the trigger until it is opened', () => {
    renderDialog();

    expect(screen.getByText('Open dialog')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on click and names itself from the title and description', async () => {
    renderDialog();

    await userEvent.click(screen.getByText('Open dialog'));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAccessibleName('Rename article');
    expect(dialog).toHaveAccessibleDescription('The URL stays the same.');
  });

  it('closes from the corner affordance', async () => {
    renderDialog();

    await userEvent.click(screen.getByText('Open dialog'));
    await userEvent.click(screen.getByRole('button', { name: 'Close modal' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('can hide the corner affordance', async () => {
    renderDialog({ showCloseButton: false });

    await userEvent.click(screen.getByText('Open dialog'));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
  });

  it('closes on Escape and reports the change', async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    await userEvent.click(screen.getByText('Open'));
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalled();
  });

  it('uses the house dialog surface: popover-free background, 4px radius, large shadow', async () => {
    renderDialog();
    await userEvent.click(screen.getByText('Open dialog'));

    const dialog = await screen.findByRole('dialog');
    expect(dialog.className).toContain('bg-background');
    expect(dialog.className).toContain('rounded-sm');
    expect(dialog.className).toContain('shadow-lg');
    expect(dialog.className).toContain('border');
    // The z-index token is what konopskidev referenced but never defined.
    expect(dialog.className).toContain('z-[var(--z-index-modal)]');
  });

  it('renders a display-face title', async () => {
    renderDialog();
    await userEvent.click(screen.getByText('Open dialog'));

    const title = await screen.findByText('Rename article');
    expect(title.className).toContain('font-display');
    expect(title.className).toContain('text-h3');
  });
});
