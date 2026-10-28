import { Badge } from './badge';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A small status descriptor next to a heading or inside a list row. Keep it to one or two words.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      description: 'Semantic colour of the badge.',
      table: { category: 'Appearance' },
    },
    asChild: {
      control: 'boolean',
      description: 'Render the child element instead of a `<span>`.',
      table: { category: 'Composition' },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    variant: 'default',
    asChild: false,
    children: 'Published',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Badge {...args}>Published</Badge>
        <Badge variant="secondary">Draft</Badge>
        <Badge variant="outline">Archived</Badge>
        <Badge variant="destructive">Failed</Badge>
      </div>
    </>
  ),
};
