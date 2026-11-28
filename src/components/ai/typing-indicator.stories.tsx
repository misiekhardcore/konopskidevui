import { expect, within } from 'storybook/test';

import { TypingIndicator } from './typing-indicator';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'AI/TypingIndicator',
  component: TypingIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The wait before an answer’s first token: three animated dots and one polite live region that announces the pending response once. Reduced motion leaves the dots still, and the row reserves one line of the answer’s own typography so the first token does not shift the layout. It renders nothing once the turn ends or the message already has content, so it can be mounted unconditionally.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['submitted', 'streaming', 'ready', 'error'],
      description: 'The conversation status, straight from `useChat`.',
      table: { category: 'State' },
    },
    hasContent: {
      control: 'boolean',
      description: 'Whether the message already shows something, which ends the wait.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    labels: { control: 'object', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: { status: 'submitted', hasContent: false },
} satisfies Meta<typeof TypingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The wait a submitted turn shows before its first token arrives. */
export const Waiting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const indicator = canvasElement.querySelector('[data-slot="typing-indicator"]');

    await expect(canvas.getByRole('status')).toHaveTextContent('Waiting for a response');
    await expect(indicator?.querySelectorAll('[data-slot="typing-indicator-dot"]')).toHaveLength(3);

    // A whole line of the answer's typography is reserved, so the first token
    // takes its place without moving the transcript.
    const height = (indicator as Element).getBoundingClientRect().height;
    const lineHeight = parseFloat(getComputedStyle(indicator as Element).lineHeight);

    await expect(height).toBeCloseTo(lineHeight, 1);
  },
};

/** A stream that has started but not produced a part yet is still a wait. */
export const Streaming: Story = {
  args: { status: 'streaming' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toBeInTheDocument();
  },
};

/** An answer that already shows a part gets the whole frame for itself. */
export const ContentPresent: Story = {
  args: { status: 'streaming', hasContent: true },
  render: (args) => (
    <div className="flex flex-col gap-2.5">
      <TypingIndicator {...args} />
      <p className="text-sm leading-relaxed">The forecast for Kraków is 21 °C and clear.</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('status')).toBeNull();
    await expect(canvas.getByText(/The forecast for Kraków/)).toBeInTheDocument();
  },
};

/** A finished turn keeps no waiting affordance, however empty it looks. */
export const Ready: Story = {
  args: { status: 'ready' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('status')).toBeNull();
  },
};

/** A failed turn is not waiting either; the app renders its own error surface. */
export const Failed: Story = {
  args: { status: 'error' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('status')).toBeNull();
  },
};

/**
 * The same three dots, still, for a reader who prefers reduced motion. This is
 * also the one composition Chromatic snapshots for this component: a static
 * frame is what a visual diff can judge, where a bouncing one would flake.
 */
export const ReducedMotion: Story = {
  parameters: {
    chromatic: { disableSnapshot: false, prefersReducedMotion: 'reduce' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('status')).toHaveTextContent('Waiting for a response');
    await expect(canvasElement.querySelectorAll('[data-slot="typing-indicator-dot"]')).toHaveLength(
      3,
    );
  },
};

/** Every string is a label, so the announcement can be translated. */
export const Translated: Story = {
  args: { labels: { waiting: 'Waiting for a response' } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(
      'Waiting for a response',
    );
  },
};
