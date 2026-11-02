import { Button } from './button';
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  subcomponents: {
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A panel that slides in from an edge: mobile navigation, a detail view, a filter tray. It is a Dialog with a side.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled open state. Leave it unset to drive the sheet from its trigger.',
      table: { category: 'State' },
    },
    defaultOpen: { control: 'boolean', table: { category: 'State' } },
    modal: {
      control: 'boolean',
      description: 'Keep the page inert while the sheet is open.',
      table: { category: 'Behaviour', defaultValue: { summary: 'true' } },
    },
    onOpenChange: { action: 'open changed', table: { category: 'Events' } },
  },
  args: {
    defaultOpen: false,
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const contentMeta = { component: SheetContent } as const satisfies Partial<
  Meta<typeof SheetContent>
>;

export const Default: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Jump to a section.</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 p-4">
          <a className="text-sm" href="/articles">
            Articles
          </a>
          <a className="text-sm" href="/projects">
            Projects
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  ),
};

/**
 * The four edges. `right` is the default because reading order starts there;
 * `bottom` is the touch-first one.
 */
export const Side: StoryObj<typeof contentMeta> = {
  args: { side: 'right', showCloseButton: true },
  argTypes: {
    side: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'The edge the panel is attached to.',
      table: { category: 'Layout', defaultValue: { summary: 'right' } },
    },
    showCloseButton: {
      control: 'boolean',
      description: 'The corner close button.',
      table: { category: 'Appearance', defaultValue: { summary: 'true' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ side, showCloseButton }) => (
    <Sheet defaultOpen>
      <SheetContent side={side} showCloseButton={showCloseButton}>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>The panel slides in from the {side ?? 'right'} edge.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

/** Without the corner button the sheet still closes on Escape and on the overlay. */
export const WithoutCloseButton: Story = {
  parameters: { controls: { include: ['defaultOpen', 'modal'] } },
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>No corner close</SheetTitle>
          <SheetDescription>Escape or the overlay dismisses it.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
