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
    align: {
      control: 'inline-radio',
      options: ['start', 'end'],
      description: 'Which side of the thread the message sits on.',
      table: { category: 'Layout', defaultValue: { summary: 'start' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    align: 'start',
  },
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <MessageGroup className="w-96">
      <Message {...args}>
        <MessageAvatar>AL</MessageAvatar>
        <MessageContent>
          <MessageHeader>Ada · 09:41</MessageHeader>
          The tokens are merged — the branch is ready for review.
          <MessageFooter>Edited</MessageFooter>
        </MessageContent>
      </Message>
      <Message align={args.align === 'end' ? 'start' : 'end'}>
        <MessageContent>On it.</MessageContent>
      </Message>
    </MessageGroup>
  ),
};

/** Both sides at once, which is what makes the alignment readable. */
export const Conversation: Story = {
  parameters: { controls: { include: ['align'] } },
  render: (args) => (
    <MessageGroup className="w-96">
      <Message {...args} align="start">
        <MessageAvatar>AL</MessageAvatar>
        <MessageContent>
          <MessageHeader>Ada · 09:41</MessageHeader>
          Can we move the release to Thursday?
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>MK</MessageAvatar>
        <MessageContent>
          <MessageHeader>Misiek · 09:42</MessageHeader>
          Thursday works. I will update the changelog.
          <MessageFooter>Sent</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
};

/** A reply can be just the body: no avatar, no header, aligned to the other side. */
export const BareReply: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <MessageGroup className="w-96">
      <Message align="start">
        <MessageAvatar>AL</MessageAvatar>
        <MessageContent>
          <MessageHeader>Ada · 09:41</MessageHeader>
          Which token should the destructive action use?
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>destructive — the one we just merged.</MessageContent>
      </Message>
    </MessageGroup>
  ),
};
