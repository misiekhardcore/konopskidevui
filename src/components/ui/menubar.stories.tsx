import {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from './menubar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Menubar',
  component: Menubar,
  tags: ['autodocs'],
  subcomponents: {
    MenubarPortal,
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarGroup,
    MenubarSeparator,
    MenubarLabel,
    MenubarItem,
    MenubarShortcut,
    MenubarCheckboxItem,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSub,
    MenubarSubTrigger,
    MenubarSubContent,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A persistent application menu, like a desktop app’s. Reach for it only in app-like surfaces; marketing pages use a navigation menu.',
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Controlled open menu, by its `value`.',
      table: { category: 'State' },
    },
    onValueChange: { action: 'value changed', table: { category: 'Events' } },
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'], table: { category: 'Accessibility' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {},
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

const contentMeta = { component: MenubarContent } as const satisfies Partial<
  Meta<typeof MenubarContent>
>;
const itemMeta = { component: MenubarItem } as const satisfies Partial<Meta<typeof MenubarItem>>;

/** Radix restores `aria-hidden` and tabindex when the menu closes; open menus trip axe. */
const openMenuA11y = {
  a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } },
};

export const Default: Story = {
  render: (args) => (
    <>
      <Menubar {...args}>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>Open…</MenubarItem>
            <MenubarSeparator />
            <MenubarItem variant="destructive">Delete</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked>Show grid</MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarRadioGroup value="left">
              <MenubarRadioItem value="left">Align left</MenubarRadioItem>
              <MenubarRadioItem value="right">Align right</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </>
  ),
};

/** Where a menu drops, and how far from its trigger. */
export const Content: StoryObj<typeof contentMeta> = {
  args: { align: 'start', alignOffset: -4, sideOffset: 8 },
  parameters: openMenuA11y,
  argTypes: {
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      description: 'Alignment against the trigger.',
      table: { category: 'Layout', defaultValue: { summary: 'start' } },
    },
    alignOffset: {
      control: 'number',
      description: 'Horizontal nudge, in pixels.',
      table: { category: 'Layout', defaultValue: { summary: '-4' } },
    },
    sideOffset: {
      control: 'number',
      description: 'Vertical gap, in pixels.',
      table: { category: 'Layout', defaultValue: { summary: '8' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <Menubar value="file">
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent {...args}>
          <MenubarItem>New</MenubarItem>
          <MenubarItem>Open…</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

/** `inset` aligns an item under a label; `destructive` tints the row. */
export const Item: StoryObj<typeof itemMeta> = {
  args: { inset: true, variant: 'default', children: 'Duplicate' },
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
    <Menubar value="edit">
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Article</MenubarLabel>
          <MenubarItem inset>Copy</MenubarItem>
          <MenubarItem {...args}>{children}</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};
