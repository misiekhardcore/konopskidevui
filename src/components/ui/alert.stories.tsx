import { Alert, AlertTitle, AlertDescription, AlertAction } from './alert';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  subcomponents: { AlertTitle, AlertDescription, AlertAction },
  parameters: {
    docs: {
      description: {
        component:
          'A short, contextual message attached to the content it explains. Use it for something the reader should know before acting, not for transient feedback — that is a toast.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: '`destructive` marks a failure or a dangerous action.',
      table: { category: 'Appearance' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    variant: 'default',
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <Alert {...args}>
        <AlertTitle>Draft saved</AlertTitle>
        <AlertDescription>Your changes are private until you publish them.</AlertDescription>
      </Alert>
    </>
  ),
};
