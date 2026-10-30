import { Progress } from './progress';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Shows how far along a known-length task is. Always give it an accessible name — a bar without a label is meaningless.',
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Completion between 0 and 100. Pass `null` for indeterminate.',
      table: { category: 'State' },
    },
    max: {
      control: { type: 'number', min: 1 },
      description: 'Upper bound `value` is measured against.',
      table: { category: 'Range', defaultValue: { summary: '100' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    value: 40,
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <div className="flex w-80 flex-col gap-2">
        <Progress {...args} aria-label="Upload progress" />
        <span className="text-sm text-muted-foreground">{args.value}% uploaded</span>
      </div>
    </>
  ),
};
