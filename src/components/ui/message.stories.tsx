import {
  MessageGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from './message';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Message',
  component: Message,
  tags: ['autodocs'],
  subcomponents: { MessageGroup, MessageAvatar, MessageContent, MessageFooter, MessageHeader },
  parameters: {
    docs: {
      description: {
        component:
          'One message in a conversation: avatar, header, body and footer. It is layout, not state — the conversation owns the data.',
      },
    },
  },
  argTypes: {
    align: { control: 'inline-radio', table: { category: 'Layout' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    align: 'start',
  },
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <MessageGroup className="w-96">
        <Message {...args} align="start">
          <MessageAvatar>AL</MessageAvatar>
          <MessageContent>
            <MessageHeader>Ada · 09:41</MessageHeader>
            The tokens are merged — the branch is ready for review.
            <MessageFooter>Edited</MessageFooter>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageContent>On it.</MessageContent>
        </Message>
      </MessageGroup>
    </>
  ),
};
