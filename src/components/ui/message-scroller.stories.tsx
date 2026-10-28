import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from './message-scroller';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/MessageScroller',
  component: MessageScroller,
  tags: ['autodocs'],
  subcomponents: {
    MessageScrollerProvider,
    MessageScrollerViewport,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerButton,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A scroll container for a message list that keeps the newest message in view and offers jump-to-latest. It needs the provider at the top.',
      },
    },
  },
  argTypes: {
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {},
} satisfies Meta<typeof MessageScroller>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <MessageScrollerProvider>
        <MessageScroller {...args} className="h-48 w-80 rounded-sm border border-border">
          <MessageScrollerViewport>
            <MessageScrollerContent className="p-3">
              {['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map((item) => (
                <MessageScrollerItem key={item} className="py-1 text-sm">
                  {item}
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </>
  ),
};
