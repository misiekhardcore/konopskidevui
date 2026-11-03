import { Button } from './button';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from './empty';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Empty',
  component: Empty,
  tags: ['autodocs'],
  subcomponents: { EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia },
  parameters: {
    docs: {
      description: {
        component:
          'The state of a list or panel that has nothing to show yet. It should say what is missing and offer the next action.',
      },
    },
  },
  argTypes: {
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {},
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

const mediaMeta = { component: EmptyMedia } as const satisfies Partial<Meta<typeof EmptyMedia>>;

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <Empty {...args}>
      <EmptyHeader>
        <EmptyMedia variant="icon">📄</EmptyMedia>
        <EmptyTitle>No articles yet</EmptyTitle>
        <EmptyDescription>Write your first draft to see it here.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>New article</Button>
      </EmptyContent>
    </Empty>
  ),
};

/** `icon` puts the glyph in a tinted tile; the default variant hugs it instead. */
export const Media: StoryObj<typeof mediaMeta> = {
  args: { variant: 'icon' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'icon'],
      description: '`icon` frames the glyph in a muted tile.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia {...args}>📄</EmptyMedia>
        <EmptyTitle>Media variant: {args.variant}</EmptyTitle>
        <EmptyDescription>One line about what to do next.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

/** Without content the empty state still has to say what is missing. */
export const WithoutAction: Story = {
  render: (args) => (
    <Empty {...args}>
      <EmptyHeader>
        <EmptyMedia variant="icon">🔍</EmptyMedia>
        <EmptyTitle>No results</EmptyTitle>
        <EmptyDescription>Try a shorter query.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};
