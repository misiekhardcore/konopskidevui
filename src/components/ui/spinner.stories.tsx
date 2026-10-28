import { Spinner } from './spinner';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A small indeterminate activity indicator. Pair it with a label — a spinner alone does not tell anyone what is happening.',
      },
    },
  },
  argTypes: {
    className: { control: 'text', table: { category: 'Styling' } },
  },
  args: {},
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <div className="flex items-center gap-3 text-sm">
        <Spinner {...args} />
        <span>Saving…</span>
      </div>
    </>
  ),
};
