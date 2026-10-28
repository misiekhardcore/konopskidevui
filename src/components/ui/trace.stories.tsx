import {
  Trace,
  TraceLine,
  TraceIcon,
  TraceTitle,
  TraceDescription,
  TraceCollapsible,
  TraceCollapsibleTrigger,
  TraceCollapsibleContent,
} from './trace';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Trace',
  component: Trace,
  tags: ['autodocs'],
  subcomponents: {
    TraceLine,
    TraceIcon,
    TraceTitle,
    TraceDescription,
    TraceCollapsible,
    TraceCollapsibleTrigger,
    TraceCollapsibleContent,
  },
  parameters: {
    docs: {
      description: {
        component:
          'A step-by-step execution trace: one line per step, with a status and an optional collapsible detail. Built for agent and build output.',
      },
    },
  },
  argTypes: {
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {},
} satisfies Meta<typeof Trace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <Trace {...args} className="w-96">
        <TraceLine status="running">
          <TraceIcon>◌</TraceIcon>
          <TraceTitle>Reading the token source</TraceTitle>
        </TraceLine>
        <TraceLine status="error">
          <TraceIcon>✕</TraceIcon>
          <TraceTitle>Could not resolve --z-index-modal</TraceTitle>
        </TraceLine>
        <TraceCollapsible>
          <TraceCollapsibleTrigger>
            <TraceTitle>Details</TraceTitle>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <TraceDescription>Checked 8 declarations in 3 files.</TraceDescription>
          </TraceCollapsibleContent>
        </TraceCollapsible>
      </Trace>
    </>
  ),
};
