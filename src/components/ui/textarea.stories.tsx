import { Textarea } from './textarea';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A multi-line text field. konopskidev adds `error` and `autoHeight`; auto-height grows the field with its content instead of scrolling inside 80px.',
      },
    },
  },
  argTypes: {
    error: {
      control: 'text',
      description: 'Validation message under the field.',
      table: { category: 'Validation' },
    },
    autoHeight: {
      control: 'boolean',
      description: 'Grow with the content instead of scrolling.',
      table: { category: 'Behaviour', defaultValue: { summary: 'false' } },
    },
    placeholder: { control: 'text', table: { category: 'Content' } },
    required: { control: 'boolean', table: { category: 'Validation' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    rows: { control: { type: 'number', min: 2, max: 20 }, table: { category: 'Layout' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    placeholder: 'Tell us what you are building',
    autoHeight: false,
    required: false,
    disabled: false,
    rows: 4,
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AutoHeight: Story = {
  args: { autoHeight: true, rows: 2 },
};

export const WithError: Story = {
  args: { error: 'Say a little more — at least 20 characters.', defaultValue: 'Too short' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'You cannot edit this' },
};
