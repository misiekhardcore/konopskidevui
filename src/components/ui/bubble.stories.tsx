import { BubbleGroup, Bubble, BubbleContent, BubbleReactions } from './bubble';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Bubble',
  component: Bubble,
  tags: ['autodocs'],
  subcomponents: { BubbleGroup, BubbleContent, BubbleReactions },
  parameters: {
    docs: {
      description: {
        component:
          'A chat message bubble aligned to the sender or receiver. Compose it with Message for the surrounding metadata.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'muted', 'tinted', 'secondary', 'outline', 'ghost', 'destructive'],
      description: 'Bubble surface.',
      table: { category: 'Appearance' },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'end'],
      description: 'Which side of the thread the bubble sits on.',
      table: { category: 'Layout' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    variant: 'default',
    align: 'start',
  },
} satisfies Meta<typeof Bubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <BubbleGroup className="w-96">
        <Bubble {...args} align="start">
          <BubbleContent>Did you get a chance to look at the PR?</BubbleContent>
        </Bubble>
        <Bubble align="end">
          <BubbleContent>Reading it now — the token refactor looks right.</BubbleContent>
        </Bubble>
      </BubbleGroup>
    </>
  ),
};
