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
      options: ['default', 'secondary', 'muted', 'tinted', 'outline', 'ghost', 'destructive'],
      description: 'Bubble surface: who said it, and how loud it is.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'end'],
      description: 'Which side of the thread the bubble sits on.',
      table: { category: 'Layout', defaultValue: { summary: 'start' } },
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

const reactionsMeta = { component: BubbleReactions } as const satisfies Partial<
  Meta<typeof BubbleReactions>
>;

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <BubbleGroup className="w-96">
      <Bubble {...args}>
        <BubbleContent>Did you get a chance to look at the PR?</BubbleContent>
      </Bubble>
      <Bubble {...args} align={args.align === 'end' ? 'start' : 'end'} variant="secondary">
        <BubbleContent>Reading it now — the token refactor looks right.</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
};

/** All seven surfaces, so the thread palette is visible in one place. */
export const Variants: Story = {
  parameters: { controls: { include: ['align'] } },
  render: (args) => (
    <BubbleGroup className="w-96">
      {(
        ['default', 'secondary', 'muted', 'tinted', 'outline', 'ghost', 'destructive'] as const
      ).map((variant) => (
        <Bubble key={variant} {...args} variant={variant}>
          <BubbleContent>{variant}</BubbleContent>
        </Bubble>
      ))}
    </BubbleGroup>
  ),
};

/** Reactions hang off an edge of the bubble; `top` sits over the copy. */
export const Reactions: StoryObj<typeof reactionsMeta> = {
  args: { side: 'bottom', align: 'end' },
  argTypes: {
    side: {
      control: 'inline-radio',
      options: ['top', 'bottom'],
      description: 'Which edge of the bubble the reactions sit on.',
      table: { category: 'Layout', defaultValue: { summary: 'bottom' } },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'end'],
      description: 'Horizontal edge.',
      table: { category: 'Layout', defaultValue: { summary: 'end' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <BubbleGroup className="w-96">
      <Bubble>
        <BubbleContent>The token refactor looks right — merging it.</BubbleContent>
        <BubbleReactions {...args}>👍 2 · 🎉 1</BubbleReactions>
      </Bubble>
    </BubbleGroup>
  ),
};

/** `asChild` makes the whole bubble the link, which is what a reply preview needs. */
export const AsLink: Story = {
  parameters: { controls: { include: ['variant'] } },
  render: (args) => (
    <BubbleGroup className="w-96">
      <Bubble {...args} variant="outline">
        <BubbleContent asChild>
          <a href="#thread">Replying to Ada · jump to thread</a>
        </BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
};
