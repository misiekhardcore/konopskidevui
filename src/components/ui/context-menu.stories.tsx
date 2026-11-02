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

import { expect, fireEvent, screen } from 'storybook/test';

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
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'], table: { category: 'Accessibility' } },
    onOpenChange: { action: 'open changed', table: { category: 'Events' } },
  },
  args: {},
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Same Radix modal-layer exemption the dropdown menu documents. */
const openMenuA11y = {
  a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } },
};

const itemMeta = { component: ContextMenuItem } as const satisfies Partial<
  Meta<typeof ContextMenuItem>
>;
const subTriggerMeta = { component: ContextMenuSubTrigger } as const satisfies Partial<
  Meta<typeof ContextMenuSubTrigger>
>;

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

/** `inset` aligns an item with its labelled siblings; `destructive` tints it. */
export const Item: StoryObj<typeof itemMeta> = {
  args: { inset: false, variant: 'default', children: 'Open' },
  parameters: openMenuA11y,
  argTypes: {
    inset: {
      control: 'boolean',
      description: 'Extra left padding, for items that sit under a label or icon.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['default', 'destructive'],
      description: '`destructive` tints the row; it never fills it.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-80 items-center justify-center rounded-sm border border-dashed border-border text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuLabel>Article</ContextMenuLabel>
        <ContextMenuItem inset>Duplicate</ContextMenuItem>
        <ContextMenuItem {...args}>{children}</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  // Context menus have no controlled open state, so the story opens it the way
  // a user does — and that is what `pnpm test:stories` then asserts.
  play: async ({ canvas }) => {
    fireEvent.contextMenu(canvas.getByText('Right click here'));
    await expect(await screen.findByRole('menu')).toHaveAttribute('data-state', 'open');
  },
};

/** The submenu trigger carries the inset too, so a nested tree keeps its left edge. */
export const SubTrigger: StoryObj<typeof subTriggerMeta> = {
  args: { inset: false, children: 'Share' },
  parameters: openMenuA11y,
  argTypes: {
    inset: {
      control: 'boolean',
      description: 'Match the inset of the sibling items.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-80 items-center justify-center rounded-sm border border-dashed border-border text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuSub>
          <ContextMenuSubTrigger {...args}>{children}</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Copy link</ContextMenuItem>
            <ContextMenuItem>Email</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvas }) => {
    fireEvent.contextMenu(canvas.getByText('Right click here'));
    await expect(await screen.findByRole('menuitem', { name: 'Share' })).toBeInTheDocument();
  },
};
