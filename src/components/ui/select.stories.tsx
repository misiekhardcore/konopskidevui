import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Select',
  component: Select,
  subcomponents: {
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectGroup,
    SelectLabel,
    SelectSeparator,
  },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A listbox for choosing one option out of many. The trigger is a 40px control like `Input`, so a form row of selects and inputs lines up.',
      },
    },
  },
  argTypes: {
    defaultValue: {
      control: 'select',
      options: ['newest', 'oldest', 'az', 'za'],
      description: 'The option selected on first render.',
      table: { category: 'State' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'Validation' } },
    name: { control: 'text', description: 'Form field name.', table: { category: 'Form' } },
  },
  args: { defaultValue: 'newest', disabled: false, required: false },
  decorators: [
    (Story) => (
      <div className="flex w-64 flex-col gap-2">
        <Label htmlFor="sort">Sort by</Label>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger id="sort" aria-label="Sort by">
        <SelectValue placeholder="Pick a sort order" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Date</SelectLabel>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Title</SelectLabel>
          <SelectItem value="az">A → Z</SelectItem>
          <SelectItem value="za">Z → A</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const WithPlaceholder: Story = {
  args: { defaultValue: undefined },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger id="sort" aria-label="Sort by">
        <SelectValue placeholder="Pick a sort order" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest first</SelectItem>
        <SelectItem value="oldest">Oldest first</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};
