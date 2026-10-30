import { Button } from './button';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  subcomponents: { HoverCardTrigger, HoverCardContent },
  parameters: {
    docs: {
      description: {
        component:
          'A preview shown on hover or focus. Never put anything interactive or essential inside it: it disappears when the pointer leaves.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled open state. Leave it unset to open on hover or focus.',
      table: { category: 'State' },
    },
    openDelay: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
      description: 'Milliseconds before the card appears.',
      table: { category: 'Behaviour' },
    },
    closeDelay: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
      description: 'Milliseconds before it hides again.',
      table: { category: 'Behaviour' },
    },
    defaultOpen: { control: 'boolean', table: { category: 'State' } },
    onOpenChange: { action: 'open changed', table: { category: 'Events' } },
  },
  args: {
    openDelay: 200,
    closeDelay: 100,
    defaultOpen: false,
  },
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <HoverCard {...args}>
        <HoverCardTrigger asChild>
          <Button variant="link">@michal</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-72">
          <p className="text-sm font-semibold">Michał Konopski</p>
          <p className="text-sm text-muted-foreground">
            Writes about design systems and the web platform.
          </p>
        </HoverCardContent>
      </HoverCard>
    </>
  ),
};
