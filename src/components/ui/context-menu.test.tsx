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
  it('renders a composed instance', () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Right click</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Open</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Right click</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Open</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

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
});
