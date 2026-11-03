import { expect, userEvent } from 'storybook/test';

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
      description: 'Track size. `sm` sits on a dense settings row.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    checked: { control: 'boolean', table: { category: 'State' } },
    defaultChecked: { control: 'boolean', table: { category: 'State' } },
    onCheckedChange: { action: 'checked changed', table: { category: 'Events' } },
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
    <div className="flex items-center gap-3">
      <Switch {...args} id="dark-mode" />
      <Label htmlFor="dark-mode">Dark mode</Label>
    </div>
  ),
  play: async ({ canvas }) => {
    const control = canvas.getByRole('switch', { name: 'Dark mode' });
    await expect(control).toBeChecked();

    await userEvent.click(control);

    await expect(control).not.toBeChecked();
  },
};

/** Both track sizes on and off, against a 40px row. */
export const Sizes: Story = {
  parameters: { controls: { include: ['disabled'] } },
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['default', 'sm'] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <Switch {...args} id={`switch-${size}`} size={size} defaultChecked />
          <Label htmlFor={`switch-${size}`}>{size}</Label>
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};
