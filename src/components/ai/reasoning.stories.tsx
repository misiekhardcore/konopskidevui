import { expect, userEvent, within } from 'storybook/test';

import { reasoningParts } from '../../testing/ai-parts';
import { Reasoning } from './reasoning';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'AI/Reasoning',
  component: Reasoning,
  tags: ['autodocs'],
  parameters: {
    // A transcript column, not a centred card: the row takes its width from the
    // container, so it must not be measured against a shrink-wrapped root.
    layout: 'padded',
    docs: {
      description: {
        component:
          'The model’s thinking, open and shimmering while it streams, then folded to one line that reports how long it took. The body is plain text and never parsed as markdown; the duration is a prop because the SDK part does not carry one.',
      },
    },
  },
  argTypes: {
    part: {
      control: false,
      description: 'The reasoning part, straight from the message.',
      table: { category: 'Data' },
    },
    durationMs: {
      control: 'number',
      description:
        'How long the model reasoned, in milliseconds. Reported once the part is done; left out, the row shows no figure.',
      table: { category: 'Data' },
    },
    labels: {
      control: 'object',
      description: 'Override any user-facing string the row shows.',
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
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    part: reasoningParts.streaming,
  },
} satisfies Meta<typeof Reasoning>;

export default meta;
type Story = StoryObj<typeof meta>;

/** While the model thinks the part is open, and its title shimmers with activity. */
export const Thinking: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Thinking/ });

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(/so I need the forecast/)).toBeInTheDocument();
  },
};

/** A finished thought folds to one line and reports how long it took. */
export const Timed: Story = {
  args: { part: reasoningParts.done, durationMs: 4200 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Thought for 4.2s' });

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    // Multi-paragraph reasoning keeps its blank line.
    await expect(canvas.getByText(/A single lookup is enough/)).toBeInTheDocument();
  },
};

/** An app that did not measure the thought shows no figure rather than a guess. */
export const UnknownDuration: Story = {
  args: { part: reasoningParts.done },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Thought' })).toBeInTheDocument();
    await expect(canvas.queryByText(/4\.2s/)).toBeNull();
  },
};

/** A stored conversation can be read with the thought already expanded. */
export const Expanded: Story = {
  args: { part: reasoningParts.done, durationMs: 83_400, open: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Thought for 1m 23s' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(canvas.getByText(/no follow-up call is needed/)).toBeInTheDocument();
  },
};
