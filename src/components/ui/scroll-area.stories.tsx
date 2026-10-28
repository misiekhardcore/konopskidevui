import { ScrollArea, ScrollBar } from './scroll-area';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  subcomponents: { ScrollBar },
  parameters: {
    docs: {
      description: {
        component:
          'A styled scroll container for long lists inside a fixed-height panel. It keeps the scrollbar consistent across platforms.',
      },
    },
  },
  argTypes: {
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {},
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <ScrollArea {...args} className="h-56 w-80 rounded-sm border border-border p-4">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 20 }, (_, index) => (
            <p key={index} className="text-sm">
              Row {index + 1}
            </p>
          ))}
        </div>
      </ScrollArea>
    </>
  ),
};
