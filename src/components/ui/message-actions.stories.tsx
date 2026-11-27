import { MessageActions } from './message-actions';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/MessageActions',
  component: MessageActions,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A per-message action row that appears only for the actions the app wires up: copy, feedback, regenerate and edit. Handlers are optional; with none provided nothing renders.',
      },
    },
  },
  argTypes: {
    onCopy: { control: false, table: { category: 'Handlers' } },
    onFeedback: { control: false, table: { category: 'Handlers' } },
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
    onCopy: () => {},
    onFeedback: () => {},
    onRegenerate: () => {},
    onEdit: () => {},
  },
};

/** Only the copy control, when the app wants nothing else on this message. */
export const CopyOnly: Story = {
  args: {
    onCopy: () => {},
  },
};

/** Copy and feedback, the two controls a reader-facing answer usually needs. */
export const CopyAndFeedback: Story = {
  args: {
    onCopy: () => {},
    onFeedback: () => {},
  },
};
