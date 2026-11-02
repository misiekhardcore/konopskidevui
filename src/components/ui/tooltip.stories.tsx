import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Tooltip',
  component: TooltipProvider,
  tags: ['autodocs'],
  subcomponents: { Tooltip, TooltipContent, TooltipTrigger },
  parameters: {
    docs: {
      description: {
        component:
          'A short label for an icon-only control, shown on hover and focus. It never replaces a visible label on its own and never holds interactive content.',
      },
    },
  },
  argTypes: {
    delayDuration: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
      description: 'Delay before a tooltip appears, in milliseconds.',
      table: { category: 'Behaviour' },
    },
    skipDelayDuration: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
      description: 'Grace period when moving between two tooltip triggers.',
      table: { category: 'Behaviour' },
    },
    disableHoverableContent: { control: 'boolean', table: { category: 'Behaviour' } },
  },
  args: {
    children: null,
    delayDuration: 0,
    skipDelayDuration: 300,
    disableHoverableContent: false,
  },
} satisfies Meta<typeof TooltipProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const contentMeta = { component: TooltipContent } as const satisfies Partial<
  Meta<typeof TooltipContent>
>;

export const Default: Story = {
  render: (args) => (
    <TooltipProvider {...args}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Copy link">
            ⧉
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy link</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

/** The four sides, all open, so the arrow direction is visible at a glance. */
export const Placement: StoryObj<typeof contentMeta> = {
  args: { side: 'top', sideOffset: 0 },
  argTypes: {
    side: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Preferred side; it flips when there is no room.',
      table: { category: 'Layout', defaultValue: { summary: 'top' } },
    },
    sideOffset: {
      control: 'number',
      description: 'Gap in pixels.',
      table: { category: 'Layout', defaultValue: { summary: '0' } },
    },
    alignOffset: { control: 'number', table: { category: 'Layout' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <TooltipProvider>
      <div className="flex items-center gap-6">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Tooltip key={side} defaultOpen>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon-sm" aria-label={side}>
                {side.charAt(0).toUpperCase()}
              </Button>
            </TooltipTrigger>
            <TooltipContent {...args} side={side}>
              {side}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
};

/** A provider delay applies to every tooltip below it; 0 is the house default. */
export const WithDelay: Story = {
  args: { delayDuration: 500 },
  render: Default.render,
};
