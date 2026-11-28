import { ChatError } from './chat-error';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'AI/ChatError',
  component: ChatError,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A conversation-level error, shown in place of the answer that never arrived. The message is rendered word for word, retry and dismiss appear only when their handlers are wired, and a missing message falls back to a readable sentence.',
      },
    },
  },
  argTypes: {
    error: { control: 'text', table: { category: 'Props' } },
    labels: { control: false, table: { category: 'Props' } },
    onRetry: { control: false, table: { category: 'Handlers' } },
    onDismiss: { control: false, table: { category: 'Handlers' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {},
} satisfies Meta<typeof ChatError>;

export default meta;
type Story = StoryObj<typeof meta>;

const PROVIDER_MESSAGE = 'Upstream service unavailable: quota exhausted (429, request 4f2c)';

/** Retry and dismiss together, the surface at its fullest. */
export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  args: {
    error: PROVIDER_MESSAGE,
    onRetry: () => {},
    onDismiss: () => {},
  },
};

/** A provider's own wording, passed through untouched. */
export const ProviderMessage: Story = {
  args: {
    error: 'Request rejected: quota exhausted for this billing period (429).',
  },
};

/** Only retry, for a failure the app expects to be temporary. */
export const RetryOnly: Story = {
  args: {
    error: PROVIDER_MESSAGE,
    onRetry: () => {},
  },
};

/** An error with no message of its own still reads as a sentence. */
export const Fallback: Story = {
  args: {
    onRetry: () => {},
    labels: {},
  },
};
