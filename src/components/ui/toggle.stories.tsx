import { expect, userEvent } from 'storybook/test';

import { Toggle } from './toggle';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A two-state button, e.g. bold text or a grid/list view. It is a button with `aria-pressed`, not a checkbox.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'outline'],
      description: 'Visual weight.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
      description: 'Control size.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    pressed: { control: 'boolean', table: { category: 'State' } },
    defaultPressed: { control: 'boolean', table: { category: 'State' } },
    onPressedChange: { action: 'pressed changed', table: { category: 'Events' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    variant: 'default',
    size: 'default',
    defaultPressed: false,
    disabled: false,
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Toggle {...args} aria-label="Toggle bold">
      <span className="font-bold">B</span>
    </Toggle>
  ),
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Toggle bold' });

    await userEvent.click(button);

    await expect(button).toHaveAttribute('aria-pressed', 'true');
  },
};

/** Both variants and all three sizes, pressed and unpressed. */
export const Sizes: Story = {
  parameters: { controls: { include: ['variant', 'disabled'] } },
  render: (args) => (
    <div className="flex items-center gap-3">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <Toggle key={size} {...args} size={size} defaultPressed aria-label={`Toggle bold, ${size}`}>
          <span className="font-bold">B</span>
        </Toggle>
      ))}
    </div>
  ),
};

/** `pressed` is the controlled form; the button exposes it as `aria-pressed`. */
export const Pressed: Story = {
  args: { defaultPressed: true },
  render: Default.render,
};
