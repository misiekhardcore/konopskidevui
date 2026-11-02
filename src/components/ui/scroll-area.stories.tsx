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
    type: {
      control: 'inline-radio',
      options: ['hover', 'scroll', 'auto', 'always'],
      description: 'When the scrollbars are visible.',
      table: { category: 'Appearance' },
    },
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'], table: { category: 'Accessibility' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {},
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const barMeta = { component: ScrollBar } as const satisfies Partial<Meta<typeof ScrollBar>>;

export const Default: Story = {
  render: (args) => (
    <ScrollArea {...args} className="h-56 w-80 rounded-sm border border-border p-4">
      <div className="flex flex-col gap-4">
        {Array.from({ length: 20 }, (_, index) => (
          <p key={index} className="text-sm">
            Row {index + 1}
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
};

/** `ScrollBar` has to be rendered by hand for the horizontal axis. */
export const Horizontal: StoryObj<typeof barMeta> = {
  args: { orientation: 'horizontal' },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: 'Which axis the bar follows.',
      table: { category: 'Layout', defaultValue: { summary: 'vertical' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ orientation }) => (
    <ScrollArea className="w-80 rounded-sm border border-border p-4 whitespace-nowrap">
      <div className="flex gap-3">
        {Array.from({ length: 14 }, (_, index) => (
          <div
            key={index}
            className="flex h-16 w-32 shrink-0 items-center justify-center rounded-sm bg-muted text-sm"
          >
            Card {index + 1}
          </div>
        ))}
      </div>
      <ScrollBar orientation={orientation} />
    </ScrollArea>
  ),
};
