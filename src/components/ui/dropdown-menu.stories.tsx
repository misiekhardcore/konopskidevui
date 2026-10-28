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
    defaultOpen: { control: 'boolean', table: { category: 'State' } },
    modal: {
      control: 'boolean',
      description: 'Trap focus and hide the rest of the page while open.',
      table: { category: 'Behaviour', defaultValue: { summary: 'true' } },
    },
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'], table: { category: 'Accessibility' } },
  },
  args: { defaultOpen: false, modal: true, dir: 'ltr' },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
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
};

export const OpenByDefault: Story = {
  args: { defaultOpen: true },
  render: Default.render,
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Radix's modal layer marks the rest of the page `aria-hidden` while
            // the menu is open, and the trigger inside it keeps its tabindex
            // until focus returns. Radix restores both as the menu closes.
            id: 'aria-hidden-focus',
            enabled: false,
          },
        ],
      },
    },
  },
};
