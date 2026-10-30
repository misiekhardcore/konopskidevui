import { fn } from 'storybook/test';

import { Checkbox } from './checkbox';
import { Label } from './label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A boolean choice that is only applied on submit. For a setting that takes effect immediately, use a `Switch` instead.',
      },
    },
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description:
        'Controlled checked state. Leave it unset and use `defaultChecked` for uncontrolled use.',
      table: { category: 'State' },
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Checked on first render.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'Validation' } },
    onCheckedChange: { action: 'checked changed', table: { category: 'Events' } },
  },
  args: { defaultChecked: false, disabled: false, required: false, onCheckedChange: fn() },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Checkbox id="newsletter" {...args} />
      <Label htmlFor="newsletter">Send me the monthly digest</Label>
    </div>
  ),
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};
