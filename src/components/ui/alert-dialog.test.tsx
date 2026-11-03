import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';

function renderAlertDialog(onConfirm = vi.fn()) {
  return render(
    <AlertDialog>
      <AlertDialogTrigger>Delete article</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this article?</AlertDialogTitle>
          <AlertDialogDescription>It cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  );
}

describe('AlertDialog', () => {
  it('stays closed until the trigger is used', () => {
    renderAlertDialog();

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('opens as an alertdialog named by its title', async () => {
    renderAlertDialog();

    await userEvent.click(screen.getByRole('button', { name: 'Delete article' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveAccessibleName('Delete this article?');
    expect(dialog).toHaveAccessibleDescription('It cannot be undone.');
  });

  it('ignores a click outside, and focuses the cancel action on open', async () => {
    renderAlertDialog();

    await userEvent.click(screen.getByRole('button', { name: 'Delete article' }));
    await screen.findByRole('alertdialog');

    expect(screen.getByRole('button', { name: 'Keep it' })).toHaveFocus();

    fireEvent.pointerDown(document.body);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('closes on the cancel action and reports the confirmation', async () => {
    const onConfirm = vi.fn();
    renderAlertDialog(onConfirm);

    await userEvent.click(screen.getByRole('button', { name: 'Delete article' }));
    await screen.findByRole('alertdialog');

    await userEvent.click(screen.getByRole('button', { name: 'Keep it' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete article' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
