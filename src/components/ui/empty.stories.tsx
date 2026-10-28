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

export const Default: Story = {
  render: (args) => (
    <>
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
    </>
  ),
};
