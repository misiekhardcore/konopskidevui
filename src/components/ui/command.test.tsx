import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';

function renderCommand() {
  return render(
    <Command>
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Articles">
          <CommandItem>New article</CommandItem>
          <CommandItem>Publish drafts</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>,
  );
}

describe('Command', () => {
  it('renders the search input and the items', () => {
    renderCommand();

    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument();
    expect(screen.getByText('New article')).toBeInTheDocument();
  });

  it('filters items as the user types', async () => {
    renderCommand();

    await userEvent.type(screen.getByPlaceholderText('Search…'), 'publish');

    expect(screen.getByText('Publish drafts')).toBeInTheDocument();
    expect(screen.queryByText('New article')).not.toBeInTheDocument();
  });

  it('shows the empty state when nothing matches', async () => {
    renderCommand();

    await userEvent.type(screen.getByPlaceholderText('Search…'), 'zzz');

    expect(await screen.findByText('No results found.')).toBeInTheDocument();
  });

  it('runs the selected item', async () => {
    const onSelect = vi.fn();
    render(
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandItem onSelect={onSelect}>Publish drafts</CommandItem>
        </CommandList>
      </Command>,
    );

    await userEvent.click(screen.getByText('Publish drafts'));

    expect(onSelect).toHaveBeenCalled();
  });

  it('renders inside a dialog when wrapped by CommandDialog', async () => {
    render(
      <CommandDialog defaultOpen>
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandItem>New article</CommandItem>
          </CommandList>
        </Command>
      </CommandDialog>,
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('New article')).toBeInTheDocument();
  });
});
