import { Separator } from './separator';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A hairline rule between groups. Purely visual by default; pass `decorative={false}` when the separation carries meaning.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Direction of the rule.',
      table: { category: 'Layout' },
    },
    decorative: {
      control: 'boolean',
      description: 'When false the separator is announced as a separator role.',
      table: { category: 'Accessibility' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    orientation: 'horizontal',
    decorative: false,
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <div className="w-80">
        <p className="text-sm">Account</p>
        <Separator {...args} className="my-4" />
        <p className="text-sm">Billing</p>
      </div>
    </>
  ),
};
