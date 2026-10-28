import { Input } from './input';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A single-line text field. konopskidev adds an `error` prop that renders the message and sets `aria-invalid`, and a placeholder helper that appends “(optional)” for fields that are not required.',
      },
    },
  },
  argTypes: {
    error: {
      control: 'text',
      description: 'Validation message under the field. Also sets `aria-invalid`.',
      table: { category: 'Validation' },
    },
    placeholder: {
      control: 'text',
      description: 'Gets “(optional)” appended unless `required` is set.',
      table: { category: 'Content' },
    },
    required: { control: 'boolean', table: { category: 'Validation' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      table: { category: 'Behaviour', defaultValue: { summary: 'text' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    placeholder: 'you@example.com',
    type: 'text',
    required: false,
    disabled: false,
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: { error: 'Enter a valid email address.', defaultValue: 'not-an-email' },
};

export const Optional: Story = {
  args: { placeholder: 'Phone number', required: false },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Locked value' },
};
