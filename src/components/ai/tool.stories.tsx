import { expect, fn, userEvent, within } from 'storybook/test';

import { dynamicToolParts, toolParts } from '../../testing/ai-parts';
import { Tool } from './tool';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'AI/Tool',
  component: Tool,
  tags: ['autodocs'],
  parameters: {
    // A transcript column, not a centred card: the row takes its width from the
    // container, so it must not be measured against a shrink-wrapped root.
    layout: 'padded',
    docs: {
      description: {
        component:
          'One tool call across its whole lifecycle, as a single collapsed row built on the trace disclosure: the tool name and the state’s one fact stay visible while arguments, output, errors and the approval card live in the body. An unanswered approval opens itself and holds the row open (ADR 0014).',
      },
    },
  },
  argTypes: {
    part: {
      control: false,
      description: 'The tool part, straight from the message.',
      table: { category: 'Data' },
    },
    labels: {
      control: 'object',
      description: 'Override any user-facing string the row shows.',
      table: { category: 'Content' },
    },
    approvalLabels: {
      control: 'object',
      description: 'Override any user-facing string the approval card shows.',
      table: { category: 'Content' },
    },
    open: {
      control: 'boolean',
      description: 'Drive the disclosure; leave unset to let the row remember its own state.',
      table: { category: 'State' },
    },
    onOpenChange: {
      control: false,
      description: 'Called with the next expanded state.',
      table: { category: 'State' },
    },
    onApprove: {
      control: false,
      description: 'Called with `{ id }` when an approval is granted.',
      table: { category: 'Behaviour' },
    },
    onDeny: {
      control: false,
      description: 'Called with `{ id, reason? }` when an approval is denied.',
      table: { category: 'Behaviour' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    part: toolParts['input-streaming'],
    onApprove: fn(),
    onDeny: fn(),
  },
} satisfies Meta<typeof Tool>;

export default meta;
type Story = StoryObj<typeof meta>;

/** While the input streams the row is already named, and the partial JSON is safe to open. */
export const Running: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /getWeather/ });

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    await expect(canvas.getByText('{"location":"Kra')).toBeInTheDocument();
  },
};

/** A call whose input is complete: the row carries the name, the arguments are one click away. */
export const Available: Story = {
  args: { part: toolParts['input-available'] },
  // The row inside a shrink-wrapped message bubble, which is where its own
  // width is decided by its contents rather than by a column.
  render: (args) => (
    <div className="w-fit max-w-full">
      <Tool {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /getWeather/ });
    const nameLeft = trigger.getBoundingClientRect().left;

    await userEvent.click(trigger);

    const details = canvasElement.querySelector('[data-slot="trace-collapsible-content-inner"]');
    const detailsWidth = details?.getBoundingClientRect().width ?? 0;

    await expect(canvas.getByText('Input')).toBeInTheDocument();
    // The details need room of their own: a body held to the label's width
    // hides the arguments behind a horizontal scrollbar.
    await expect(detailsWidth).toBeGreaterThan(trigger.getBoundingClientRect().width);
    // The bubble grows to the right, so the name stays where it was.
    await expect(trigger.getBoundingClientRect().left).toBeCloseTo(nameLeft, 1);
  },
};

/** A pending approval is the one row that opens itself and will not collapse. */
export const AwaitingApproval: Story = {
  args: { part: toolParts['approval-requested'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /getWeather/ });

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(trigger);

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
  },
};

/** A recorded decision collapses again, and the summary says what was decided. */
export const Answered: Story = {
  args: { part: toolParts['approval-responded'] },
};

/** A finished call: structured output reads as JSON in the code block chrome. */
export const Completed: Story = {
  args: { part: toolParts['output-available'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /getWeather/ }));

    await expect(canvas.getByText(/"temperatureC": 21/)).toBeInTheDocument();
  },
};

/** A failed call keeps the tool's name and puts the error in the destructive body. */
export const Failed: Story = {
  args: { part: toolParts['output-error'] },
};

/** A provider-executed call is marked apart from one the client ran. */
export const ProviderExecuted: Story = {
  args: { part: dynamicToolParts['output-available'] },
};

/** A tool the app did not type is still named, by its runtime-provided name. */
export const DynamicTool: Story = {
  args: { part: dynamicToolParts['input-available'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /lookup_order/ }));

    // A dynamic tool's arguments are as readable as a typed tool's.
    await expect(canvas.getByText(/"orderId"/)).toBeInTheDocument();
  },
};
