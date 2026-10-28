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

export const Default: Story = {
  render: (args) => (
    <>
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
    </>
  ),
};
