import { MessageActions } from './message-actions';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'AI/MessageActions',
  component: MessageActions,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A per-message action row for AI chats: copy, two separate feedback buttons, regenerate and edit. Every action is optional and renders only when its handler is wired; with none provided nothing renders.',
      },
    },
  },
  argTypes: {
    copyValue: { control: 'text', table: { category: 'Props' } },
    feedback: {
      control: 'inline-radio',
      options: ['up', 'down', null],
      table: { category: 'Props' },
    },
    onCopy: { control: false, table: { category: 'Handlers' } },
    onFeedbackChange: { control: false, table: { category: 'Handlers' } },
    onRegenerate: { control: false, table: { category: 'Handlers' } },
    onEdit: { control: false, table: { category: 'Handlers' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {},
} satisfies Meta<typeof MessageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every action wired at once, the row at its fullest. */
export const Default: Story = {
  parameters: { chromatic: { disableSnapshot: false } },
  args: {
    copyValue: 'The capital of Poland is Kraków.',
    onCopy: () => {},
    feedback: null,
    onFeedbackChange: () => {},
    onRegenerate: () => {},
    onEdit: () => {},
  },
};

/** The vote the app recorded is the pressed state of the matching button. */
export const Voted: Story = {
  args: {
    copyValue: 'The capital of Poland is Kraków.',
    onCopy: () => {},
    feedback: 'up',
    onFeedbackChange: () => {},
  },
};

/** Only the copy control, when the app wants nothing else on this message. */
export const CopyOnly: Story = {
  args: {
    copyValue: 'The capital of Poland is Kraków.',
    onCopy: () => {},
  },
};

/** Regenerate and edit, for a message the reader can act on but not rate. */
export const RegenerateAndEdit: Story = {
  args: {
    onRegenerate: () => {},
    onEdit: () => {},
  },
};
