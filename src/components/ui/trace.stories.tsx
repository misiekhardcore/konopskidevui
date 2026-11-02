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

const lineMeta = { component: TraceLine } as const satisfies Partial<Meta<typeof TraceLine>>;

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

/** The three statuses: running shimmers, error tints, pending fades. */
export const Statuses: StoryObj<typeof lineMeta> = {
  args: { status: 'running' },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['running', 'pending', 'error'],
      description: '`running` shimmers the title, `error` tints the line, `pending` fades it.',
      table: { category: 'State' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ status }) => (
    <Trace className="w-96">
      {(['running', 'pending', 'error'] as const).map((value) => (
        <TraceLine key={value} status={value}>
          <TraceIcon>{value === 'error' ? '✕' : '◌'}</TraceIcon>
          <TraceTitle>{value}</TraceTitle>
        </TraceLine>
      ))}
      <TraceLine status={status}>
        <TraceIcon>◌</TraceIcon>
        <TraceTitle>Controlled by the panel: {status}</TraceTitle>
      </TraceLine>
    </Trace>
  ),
};

/** The collapsible is a real disclosure: the trigger carries the state and the detail follows. */
export const Collapsible: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Trace className="w-96">
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceTitle>Read 8 declarations</TraceTitle>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <TraceDescription>src/styles/tokens.css · 3 matches</TraceDescription>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  ),
};
