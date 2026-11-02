import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from './context-menu';

describe('ContextMenu', () => {
  it('opens on right click', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Area</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Open</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    await userEvent.pointer({ keys: '[MouseRight]', target: screen.getByText('Area') });

    expect(await screen.findByRole('menuitem', { name: 'Open' })).toBeInTheDocument();
  });

  it('closes after choosing an item', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Area</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Open</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    await userEvent.pointer({ keys: '[MouseRight]', target: screen.getByText('Area') });
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Open' }));

    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Area</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Open</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    await userEvent.pointer({ keys: '[MouseRight]', target: screen.getByText('Area') });
    expect(await screen.findByRole('menuitem', { name: 'Open' })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });
});
