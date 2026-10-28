import { Button } from './button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Command',
  component: Command,
  subcomponents: {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
    CommandShortcut,
  },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A searchable command palette. The inline Command is the layout; CommandDialog wraps it in a Dialog for ⌘K. Items stay real, focusable buttons so keyboard users can reach every action.',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            // cmdk renders `role="separator"` inside the `role="listbox"` list,
            // which axe does not allow. It is cmdk's markup, not ours, and the
            // list still announces its options and groups correctly.
            id: 'aria-required-children',
            enabled: false,
          },
        ],
      },
    },
  },
  argTypes: {
    shouldFilter: {
      control: 'boolean',
      description: 'Filter items by the search query (cmdk does it for you by default).',
      table: { category: 'Behaviour', defaultValue: { summary: 'true' } },
    },
    loop: {
      control: 'boolean',
      description: 'Wrap keyboard navigation at the ends of the list.',
      table: { category: 'Behaviour', defaultValue: { summary: 'false' } },
    },
    label: {
      control: 'text',
      description: 'Accessible name of the list.',
      table: { category: 'Accessibility' },
    },
  },
  args: { shouldFilter: true, loop: false, label: 'Command menu' },
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Command {...args} className="w-96 rounded-sm border border-border">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Articles">
          <CommandItem>
            New article <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>Publish all drafts</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>Open settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const InDialog: Story = {
  parameters: { controls: { include: ['label'] } },
  render: (args) => (
    <CommandDialog defaultOpen title="Command palette" description="Search for a command to run.">
      <Command label={args.label}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Articles">
            <CommandItem>
              New article <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  ),
};

export const WithButton: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-muted-foreground">Press ⌘K to open the palette.</p>
      <Button variant="outline">Search…</Button>
    </div>
  ),
};
