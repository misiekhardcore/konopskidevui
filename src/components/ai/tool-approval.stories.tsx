import { expect, fn, userEvent, within } from 'storybook/test';

import { dynamicToolParts, toolParts } from '../../testing/ai-parts';
import { ToolApproval } from './tool-approval';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'AI/ToolApproval',
  component: ToolApproval,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'An approval request for one tool call, inline in the message: the tool name, the arguments the decision is about and, when one was recorded, the decision itself. Approve and deny are events carrying the approval id — the app forwards them to `addToolApprovalResponse`.',
      },
    },
  },
  argTypes: {
    part: {
      control: false,
      description: 'The approval-bearing tool part, straight from the message.',
      table: { category: 'Data' },
    },
    labels: {
      control: 'object',
      description: 'Override any user-facing string the card shows.',
      table: { category: 'Content' },
    },
    onApprove: {
      control: false,
      description: 'Called with `{ id }` when the request is approved.',
      table: { category: 'Behaviour' },
    },
    onDeny: {
      control: false,
      description: 'Called with `{ id, reason? }` when the request is declined.',
      table: { category: 'Behaviour' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    part: toolParts['approval-requested'],
    onApprove: fn(),
    onDeny: fn(),
  },
} satisfies Meta<typeof ToolApproval>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The request: the tool, its arguments and the answer buttons. */
export const Request: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Approve' }));

    await expect(args.onApprove).toHaveBeenCalledWith({ id: 'approval_getWeather' });
  },
};

/** A decision the app has already recorded arrives approved, with no buttons. */
export const Approved: Story = {
  args: { part: toolParts['approval-responded'] },
};

/** A denial, read back with the reason the person gave. */
export const Declined: Story = {
  args: { part: toolParts['output-denied'] },
};

/** A tool the app did not type is still named, by its runtime name. */
export const DynamicTool: Story = {
  args: { part: dynamicToolParts['approval-requested'] },
};

/** While the app's answer is unsettled the buttons stay disabled. */
export const Pending: Story = {
  args: { onApprove: fn(() => new Promise<void>(() => {})) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Approve' }));

    await expect(canvas.getByRole('button', { name: 'Approve' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Decline' })).toBeDisabled();
  },
};
