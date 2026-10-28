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
      control: 'select',
      options: ['default', 'outline'],
      description: 'Visual weight.',
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Control size.',
      table: { category: 'Appearance' },
    },
    defaultPressed: { control: 'boolean', table: { category: 'State' } },
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
    <>
      <Toggle {...args} aria-label="Toggle bold">
        <span className="font-bold">B</span>
      </Toggle>
    </>
  ),
};
