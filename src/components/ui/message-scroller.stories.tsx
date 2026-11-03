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

const buttonMeta = { component: MessageScrollerButton } as const satisfies Partial<
  Meta<typeof MessageScrollerButton>
>;
const itemMeta = { component: MessageScrollerItem } as const satisfies Partial<
  Meta<typeof MessageScrollerItem>
>;

const items = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <MessageScrollerProvider>
      <MessageScroller {...args} className="h-48 w-80 rounded-sm border border-border">
        <MessageScrollerViewport>
          <MessageScrollerContent className="p-3">
            {items.map((item) => (
              <MessageScrollerItem key={item} className="py-1 text-sm">
                {item}
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  ),
};

/** The jump button can point either way and borrows the `Button` scale. */
export const Button: StoryObj<typeof buttonMeta> = {
  args: { direction: 'end', variant: 'secondary', size: 'icon-sm' },
  argTypes: {
    direction: {
      control: 'inline-radio',
      options: ['start', 'end'],
      description: 'Which end of the list the button jumps to.',
      table: { category: 'Behaviour', defaultValue: { summary: 'end' } },
    },
    variant: {
      control: 'select',
      description: 'Button weight.',
      table: { category: 'Appearance', defaultValue: { summary: 'secondary' } },
    },
    size: {
      control: 'select',
      description: 'Button size.',
      table: { category: 'Appearance', defaultValue: { summary: 'icon-sm' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <MessageScrollerProvider>
      <MessageScroller className="h-48 w-80 rounded-sm border border-border">
        <MessageScrollerViewport>
          <MessageScrollerContent className="p-3">
            {items.map((item) => (
              <MessageScrollerItem key={item} className="py-1 text-sm">
                {item}
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton {...args} />
      </MessageScroller>
    </MessageScrollerProvider>
  ),
};

/** `scrollAnchor` marks the item the scroller keeps pinned; there is one per list. */
export const Anchor: StoryObj<typeof itemMeta> = {
  args: { scrollAnchor: true },
  argTypes: {
    scrollAnchor: {
      control: 'boolean',
      description: 'Pin this item to the end of the viewport as content grows.',
      table: { category: 'Behaviour', defaultValue: { summary: 'false' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <MessageScrollerProvider>
      <MessageScroller className="h-48 w-80 rounded-sm border border-border">
        <MessageScrollerViewport>
          <MessageScrollerContent className="p-3">
            {items.map((item) => (
              <MessageScrollerItem key={item} className="py-1 text-sm">
                {item}
              </MessageScrollerItem>
            ))}
            <MessageScrollerItem {...args} className="py-1 text-sm">
              Newest message
            </MessageScrollerItem>
          </MessageScrollerContent>
        </MessageScrollerViewport>
      </MessageScroller>
    </MessageScrollerProvider>
  ),
};
