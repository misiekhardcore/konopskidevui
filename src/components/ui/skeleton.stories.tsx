import { Skeleton } from './skeleton';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A placeholder block shown while content loads. It replaces the shape of the content, not a spinner.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Sizing belongs here: a skeleton without dimensions renders nothing visible.',
      table: { category: 'Layout' },
    },
  },
  args: {
    className: 'h-10 w-10',
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <div className="w-80 space-y-3">
        <Skeleton {...args} className="h-40 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </>
  ),
};
