import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerDescription } from './drawer';

describe('Drawer', () => {
  it('opens and exposes its title', async () => {
    render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow the list.</DrawerDescription>
        </DrawerContent>
      </Drawer>,
    );

    await userEvent.click(screen.getByText('Open'));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('reports the dismissal', async () => {
    const onOpenChange = vi.fn();
    render(
      <Drawer defaultOpen onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});
