import { expect, screen, userEvent } from 'storybook/test';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

const meta = {
  title: 'Components/Dropdown Menu',
  component: DropdownMenu,
  subcomponents: {
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
  },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A menu of actions for one control. Items are 40px-friendly rows with the house radius, and destructive items use the tinted destructive treatment rather than a filled row.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled open state. Leave it unset to drive the menu from its trigger.',
      table: { category: 'State' },
    },
    defaultOpen: { control: 'boolean', table: { category: 'State' } },
    modal: {
      control: 'boolean',
      description: 'Trap focus and hide the rest of the page while open.',
      table: { category: 'Behaviour', defaultValue: { summary: 'true' } },
    },
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'], table: { category: 'Accessibility' } },
    onOpenChange: { action: 'open changed', table: { category: 'Events' } },
  },
  args: { defaultOpen: false, modal: true, dir: 'ltr' },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Radix's modal layer marks the rest of the page `aria-hidden` while a menu is
 * open, and the trigger inside it keeps its tabindex until focus returns. Radix
 * restores both as the menu closes, so the open-by-default stories opt out.
 */
const openMenuA11y = {
  a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } },
};

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { ...openMenuA11y, chromatic: { disableSnapshot: false } },
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>By email</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>Show drafts</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value="comfortable">
          <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete account</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));

    await expect(await screen.findByRole('menuitem', { name: /Profile/ })).toBeInTheDocument();
  },
};

const contentMeta = { component: DropdownMenuContent } as const satisfies Partial<
  Meta<typeof DropdownMenuContent>
>;
const itemMeta = { component: DropdownMenuItem } as const satisfies Partial<
  Meta<typeof DropdownMenuItem>
>;

/** Where the menu opens, and how far from its trigger. */
export const Content: StoryObj<typeof contentMeta> = {
  args: { align: 'start', sideOffset: 4 },
  parameters: openMenuA11y,
  argTypes: {
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      description: 'Alignment against the trigger.',
      table: { category: 'Layout', defaultValue: { summary: 'start' } },
    },
    sideOffset: {
      control: 'number',
      description: 'Gap in pixels.',
      table: { category: 'Layout', defaultValue: { summary: '4' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...args} className="w-56">
        <DropdownMenuLabel>Frequency</DropdownMenuLabel>
        <DropdownMenuItem>Weekly</DropdownMenuItem>
        <DropdownMenuItem>Monthly</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** `inset` lines an item up with the labelled ones; `destructive` is the tinted treatment. */
export const Item: StoryObj<typeof itemMeta> = {
  args: { inset: true, variant: 'default', children: 'Archive' },
  parameters: openMenuA11y,
  argTypes: {
    inset: {
      control: 'boolean',
      description: 'Extra left padding, for items under an icon column or a label.',
      table: { category: 'Layout', defaultValue: { summary: 'false' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['default', 'destructive'],
      description: '`destructive` tints the row and its icon; it does not fill it.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Article</DropdownMenuLabel>
        <DropdownMenuItem inset>Duplicate</DropdownMenuItem>
        <DropdownMenuItem {...args}>{children}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const OpenByDefault: Story = {
  args: { defaultOpen: true },
  render: Default.render,
  parameters: openMenuA11y,
};

const checkboxMeta = { component: DropdownMenuCheckboxItem } as const satisfies Partial<
  Meta<typeof DropdownMenuCheckboxItem>
>;
const radioMeta = { component: DropdownMenuRadioItem } as const satisfies Partial<
  Meta<typeof DropdownMenuRadioItem>
>;
const labelMeta = { component: DropdownMenuLabel } as const satisfies Partial<
  Meta<typeof DropdownMenuLabel>
>;
const subTriggerMeta = { component: DropdownMenuSubTrigger } as const satisfies Partial<
  Meta<typeof DropdownMenuSubTrigger>
>;

function OpenMenuFrame({ children }: { children: ReactNode }) {
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">{children}</DropdownMenuContent>
    </DropdownMenu>
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
      <DropdownMenuCheckboxItem {...args}>{children}</DropdownMenuCheckboxItem>
    </OpenMenuFrame>
  ),
};

/** A radio row needs the group that owns the value. */
export const RadioItem: StoryObj<typeof radioMeta> = {
  args: { inset: false, value: 'weekly', children: 'Weekly' },
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
      <DropdownMenuRadioGroup value="weekly">
        <DropdownMenuRadioItem {...args}>{children}</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </OpenMenuFrame>
  ),
};

/** The label is a heading, not a disabled row: it takes `inset` and nothing else. */
export const Label: StoryObj<typeof labelMeta> = {
  args: { inset: false, children: 'Frequency' },
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
      <DropdownMenuLabel {...args}>{children}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Weekly</DropdownMenuItem>
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
      <DropdownMenuSub>
        <DropdownMenuSubTrigger {...args}>{children}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Copy link</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </OpenMenuFrame>
  ),
};
