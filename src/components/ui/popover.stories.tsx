import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from './popover';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  subcomponents: {
    PopoverAnchor,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A floating panel anchored to a button: filters, settings, a small form. For a full-screen decision use a Dialog instead.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled open state. Leave it unset to drive the popover from its trigger.',
      table: { category: 'State' },
    },
    defaultOpen: { control: 'boolean', table: { category: 'State' } },
    modal: {
      control: 'boolean',
      description: 'Keep the rest of the page inert while the popover is open.',
      table: { category: 'Behaviour' },
    },
    onOpenChange: { action: 'open changed', table: { category: 'Events' } },
  },
  args: {
    defaultOpen: false,
    modal: false,
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const contentMeta = { component: PopoverContent } as const satisfies Partial<
  Meta<typeof PopoverContent>
>;

export const Default: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="outline">Open filters</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <PopoverHeader>
          <PopoverTitle>Filters</PopoverTitle>
          <PopoverDescription>Narrow the article list.</PopoverDescription>
        </PopoverHeader>
        <div className="mt-4 flex flex-col gap-2">
          <Label htmlFor="tag">Tag</Label>
          <Input id="tag" placeholder="typescript" />
        </div>
      </PopoverContent>
    </Popover>
  ),
};

/** Which edge the panel prefers, and how far it sits from the trigger. */
export const Placement: StoryObj<typeof contentMeta> = {
  args: { side: 'bottom', align: 'center', sideOffset: 4 },
  argTypes: {
    side: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Preferred side; it flips when the viewport runs out.',
      table: { category: 'Layout', defaultValue: { summary: 'bottom' } },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      description: 'Alignment against the trigger.',
      table: { category: 'Layout', defaultValue: { summary: 'center' } },
    },
    sideOffset: {
      control: 'number',
      description: 'Gap in pixels.',
      table: { category: 'Layout', defaultValue: { summary: '4' } },
    },
    alignOffset: { control: 'number', table: { category: 'Layout' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="outline">Anchored here</Button>
      </PopoverTrigger>
      {/* Radix gives the panel `role="dialog"`, so it needs a name of its own. */}
      <PopoverContent {...args} aria-label="Placement" className="w-60">
        <PopoverHeader>
          <PopoverTitle>Placement</PopoverTitle>
          <PopoverDescription>
            {args.side ?? 'bottom'} · {args.align ?? 'center'}
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};

/** An anchor costs no trigger: the panel attaches to an element that is already on screen. */
export const WithAnchor: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Popover defaultOpen>
      <PopoverAnchor asChild>
        <div className="rounded-sm border border-dashed border-input px-6 py-3 text-sm text-muted-foreground">
          Anchored to this box
        </div>
      </PopoverAnchor>
      <PopoverContent aria-label="No trigger needed" className="w-60">
        <PopoverHeader>
          <PopoverTitle>No trigger needed</PopoverTitle>
          <PopoverDescription>Useful for inline editing.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};
