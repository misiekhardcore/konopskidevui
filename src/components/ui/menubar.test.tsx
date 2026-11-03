import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarShortcut,
} from './menubar';

describe('Menubar', () => {
  it('opens a menu from its trigger', async () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    await userEvent.click(screen.getByRole('menuitem', { name: 'File' }));
    expect(await screen.findByRole('menuitem', { name: 'New' })).toBeInTheDocument();
  });

  it('closes the open menu on Escape', async () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    await userEvent.click(screen.getByRole('menuitem', { name: 'File' }));
    expect(await screen.findByRole('menuitem', { name: 'New' })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('menuitem', { name: 'New' })).not.toBeInTheDocument();
  });

  it('shows the keyboard shortcut beside its item', async () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    await userEvent.click(screen.getByRole('menuitem', { name: 'File' }));

    expect(await screen.findByRole('menuitem', { name: /New/ })).toContainElement(
      screen.getByText('⌘N'),
    );
  });
});
