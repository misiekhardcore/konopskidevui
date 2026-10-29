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
  type DialogContentProps,
} from './dialog';

function renderDialog(props: DialogContentProps = {}) {
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

  it('lets the backdrop be restyled, so it can follow the theme', async () => {
    renderDialog({ overlayClassName: 'bg-foreground/50' });
    await userEvent.click(screen.getByText('Open dialog'));

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay?.className).toContain('bg-foreground/50');
    // Same class group, so tailwind-merge drops the default veil instead of
    // leaving the result to stylesheet order.
    expect(overlay?.className).not.toContain('bg-black/80');
  });

  it('can drop the backdrop entirely', async () => {
    renderDialog({ showOverlay: false });
    await userEvent.click(screen.getByText('Open dialog'));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeNull();
  });

  it('replaces the corner affordance with a consumer node', async () => {
    renderDialog({ closeButton: <button type="button">Dismiss</button> });
    await userEvent.click(screen.getByText('Open dialog'));

    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('still understands the deprecated boolean', async () => {
    renderDialog({ closeButton: false });
    await userEvent.click(screen.getByText('Open dialog'));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
  });

  it('renders a full-bleed layer in the bare variant, with no card chrome', async () => {
    renderDialog({ variant: 'bare' });
    await userEvent.click(screen.getByText('Open dialog'));

    const dialog = await screen.findByRole('dialog');
    expect(dialog.className).toContain('inset-0');

    // Everything the card adds, and that a viewer had to cancel by hand.
    for (const cancelled of ['bg-background', 'rounded-sm', 'shadow-lg', 'max-w-lg', 'p-6']) {
      expect(dialog.className).not.toContain(cancelled);
    }

    expect(dialog.className).not.toContain('animate-in');
    expect(dialog.className).not.toContain('zoom-in-95');
  });
});
