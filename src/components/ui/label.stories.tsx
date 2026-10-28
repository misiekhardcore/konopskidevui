import { Input } from './input';
import { Label } from './label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The accessible name of a form control. Always associate it with `htmlFor`, and never rely on a placeholder instead.',
      },
    },
  },
  argTypes: {
    children: { control: 'text', table: { category: 'Content' } },
    htmlFor: {
      control: 'text',
      description: 'The `id` of the control this label names. Required for a real form.',
      table: { category: 'Accessibility' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    children: 'Article title',
    htmlFor: 'title',
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <div className="flex flex-col gap-2">
        <Label {...args} htmlFor="title">
          Article title
        </Label>
        <Input id="title" placeholder="On design systems" />
      </div>
    </>
  ),
};
