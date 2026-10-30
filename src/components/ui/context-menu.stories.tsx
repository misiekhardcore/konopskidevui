import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from './context-menu';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  subcomponents: {
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuCheckboxItem,
    ContextMenuRadioItem,
    ContextMenuLabel,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuGroup,
    ContextMenuPortal,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuRadioGroup,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Actions for one item, opened with a right click or the context-menu key. The same actions must also be reachable from a visible control.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled open state. Leave it unset to open on right click.',
      table: { category: 'State' },
    },
    modal: {
      control: 'boolean',
      description: 'Keep the page inert while the menu is open.',
      table: { category: 'Behaviour' },
    },
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'], table: { category: 'Accessibility' } },
    onOpenChange: { action: 'open changed', table: { category: 'Events' } },
  },
  args: {
    modal: true,
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <ContextMenu {...args}>
        <ContextMenuTrigger className="flex h-32 w-80 items-center justify-center rounded-sm border border-dashed border-border text-sm">
          Right click here
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuLabel>Article</ContextMenuLabel>
          <ContextMenuItem>
            Open <ContextMenuShortcut>↵</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>Duplicate</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Copy link</ContextMenuItem>
              <ContextMenuItem>Email</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  ),
};
