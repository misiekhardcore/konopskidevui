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

export const Default: Story = {
  render: (args) => (
    <>
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
    </>
  ),
};
