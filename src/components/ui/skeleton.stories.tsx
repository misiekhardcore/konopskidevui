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
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <div className="w-80 space-y-3">
      <Skeleton {...args} className="h-40 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};

/** A card-shaped placeholder reserves the real layout, so nothing shifts when it lands. */
export const CardShape: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-80 rounded-sm border border-border p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      </div>
      <Skeleton className="mt-4 h-24 w-full" />
    </div>
  ),
};

/** A paragraph of text has a shape too: one taller title line, then shorter lines. */
export const TextLines: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-80 space-y-2">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />
    </div>
  ),
};
