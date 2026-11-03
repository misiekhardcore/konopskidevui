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
import type { ReactNode } from 'react';

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
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
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

const checkboxMeta = { component: MenubarCheckboxItem } as const satisfies Partial<
  Meta<typeof MenubarCheckboxItem>
>;
const radioMeta = { component: MenubarRadioItem } as const satisfies Partial<
  Meta<typeof MenubarRadioItem>
>;
const labelMeta = { component: MenubarLabel } as const satisfies Partial<Meta<typeof MenubarLabel>>;
const subTriggerMeta = { component: MenubarSubTrigger } as const satisfies Partial<
  Meta<typeof MenubarSubTrigger>
>;

/** `value` opens the menu without a click, which is what the controls need. */
function OpenMenuFrame({ children }: { children: ReactNode }) {
  return (
    <Menubar value="edit">
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>{children}</MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

/** A checkbox row toggles in place and keeps the menu open. */
export const CheckboxItem: StoryObj<typeof checkboxMeta> = {
  args: { inset: false, defaultChecked: true, children: 'Show grid' },
  parameters: openMenuA11y,
  argTypes: {
    inset: {
      control: 'boolean',
      description: 'Extra left padding, for rows under a label or an icon column.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <OpenMenuFrame>
      <MenubarCheckboxItem {...args}>{children}</MenubarCheckboxItem>
    </OpenMenuFrame>
  ),
};

/** A radio row needs the group that owns the value. */
export const RadioItem: StoryObj<typeof radioMeta> = {
  args: { inset: false, value: 'left', children: 'Align left' },
  parameters: openMenuA11y,
  argTypes: {
    inset: {
      control: 'boolean',
      description: 'Extra left padding, for rows under a label or an icon column.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <OpenMenuFrame>
      <MenubarRadioGroup value="left">
        <MenubarRadioItem {...args}>{children}</MenubarRadioItem>
      </MenubarRadioGroup>
    </OpenMenuFrame>
  ),
};

/** The label is a heading, not a disabled row: it takes `inset` and nothing else. */
export const Label: StoryObj<typeof labelMeta> = {
  args: { inset: false, children: 'Alignment' },
  parameters: openMenuA11y,
  argTypes: {
    inset: {
      control: 'boolean',
      description: 'Match the inset of the rows below it.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <OpenMenuFrame>
      <MenubarLabel {...args}>{children}</MenubarLabel>
      <MenubarSeparator />
      <MenubarItem>Weekly</MenubarItem>
    </OpenMenuFrame>
  ),
};

/** `inset` keeps a nested tree aligned with the rows above it. */
export const SubTrigger: StoryObj<typeof subTriggerMeta> = {
  args: { inset: false, children: 'Share' },
  parameters: openMenuA11y,
  argTypes: {
    inset: {
      control: 'boolean',
      description: 'Match the inset of the sibling rows.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <OpenMenuFrame>
      <MenubarSub>
        <MenubarSubTrigger {...args}>{children}</MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem>Copy link</MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
    </OpenMenuFrame>
  ),
};
