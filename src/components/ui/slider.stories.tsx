import { Slider } from './slider';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Picks a number where the position matters more than the exact value. Always print the current value next to it — the thumb alone is not readable.',
      },
    },
  },
  argTypes: {
    value: {
      control: 'object',
      description: 'Controlled value. Same array shape as `defaultValue`.',
      table: { category: 'State' },
    },
    defaultValue: {
      control: 'object',
      description: 'Always an array: `[40]`, or `[20, 80]` for a range.',
      table: { category: 'State' },
    },
    min: { control: { type: 'number' }, table: { category: 'Range' } },
    max: { control: { type: 'number' }, table: { category: 'Range' } },
    step: { control: { type: 'number', min: 1, max: 20 }, table: { category: 'Range' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    onValueChange: { action: 'value changed', table: { category: 'Events' } },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      table: { category: 'Layout' },
    },
  },
  args: {
    defaultValue: [40],
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    orientation: 'horizontal',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Slider {...args} aria-label="Font size" />,
};

export const Range: Story = {
  parameters: { controls: { include: ['min', 'max', 'step', 'disabled'] } },
  render: (args) => <Slider {...args} defaultValue={[20, 80]} aria-label="Price range" />,
};

export const WithValue: Story = {
  parameters: { controls: { include: ['defaultValue', 'min', 'max', 'step'] } },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Slider {...args} aria-label="Font size" />
      <span className="text-sm text-muted-foreground">
        Font size: {String((args.defaultValue as number[])[0])}px
      </span>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};
