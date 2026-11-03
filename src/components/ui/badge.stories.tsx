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
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'tag', 'link'],
      description: 'Semantic colour of the badge.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
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
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args}>Published</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="outline">Archived</Badge>
      <Badge variant="destructive">Failed</Badge>
      <Badge variant="tag">TypeScript</Badge>
    </div>
  ),
};

/** Every variant, including `ghost` and `link`, which the row above leaves out. */
export const Variants: Story = {
  parameters: { controls: { include: ['asChild'] } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {(['default', 'secondary', 'destructive', 'outline', 'ghost', 'tag', 'link'] as const).map(
        (variant) => (
          <Badge key={variant} {...args} variant={variant}>
            {variant}
          </Badge>
        ),
      )}
    </div>
  ),
};

/** `asChild` lets the badge be the link itself, which is what a tag list needs. */
export const AsLink: Story = {
  args: { asChild: true, variant: 'tag' },
  parameters: { controls: { include: ['variant', 'asChild'] } },
  render: (args) => (
    <Badge {...args}>
      <a href="#typescript">TypeScript</a>
    </Badge>
  ),
};
