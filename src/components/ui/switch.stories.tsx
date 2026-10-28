import { Label } from './label';
import { Switch } from './switch';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Turns a setting on or off, applied immediately. For a choice that needs a save step, use a Checkbox.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'default'],
      description: 'Track size.',
      table: { category: 'Appearance' },
    },
    defaultChecked: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    size: 'default',
    defaultChecked: true,
    disabled: false,
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <div className="flex items-center gap-3">
        <Switch {...args} id="dark-mode" />
        <Label htmlFor="dark-mode">Dark mode</Label>
      </div>
    </>
  ),
};
