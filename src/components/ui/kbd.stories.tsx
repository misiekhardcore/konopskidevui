import { Button } from './button';
import { Kbd, KbdGroup } from './kbd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  tags: ['autodocs'],
  subcomponents: { KbdGroup },
  parameters: {
    docs: {
      description: {
        component: 'Renders a keyboard key or shortcut, matching the platform the reader is on.',
      },
    },
  },
  argTypes: {
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    children: '⌘',
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <div className="flex items-center gap-3 text-sm">
      <span>Open the palette</span>
      <KbdGroup>
        <Kbd {...args}>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </div>
  ),
};

/** A single key, for a shortlist in a menu row. */
export const Single: Story = {
  args: { children: 'Esc' },
  render: (args) => (
    <div className="flex items-center gap-2 text-sm">
      <span>Close</span>
      <Kbd {...args} />
    </div>
  ),
};

/**
 * Inside a tooltip the key inverts: the tooltip's own surface is the contrast
 * pair, so `Kbd` switches to `bg-background/20` and the tooltip's text colour.
 */
export const InTooltip: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Search">
            ⌕
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Search{' '}
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
