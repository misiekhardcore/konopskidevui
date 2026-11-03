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
      control: 'inline-radio',
      options: ['default', 'destructive'],
      description: '`destructive` marks a failure or a dangerous action.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
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
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Draft saved</AlertTitle>
      <AlertDescription>Your changes are private until you publish them.</AlertDescription>
    </Alert>
  ),
};

/** The destructive variant is not a different layout — only the title and border change. */
export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Publish failed</AlertTitle>
      <AlertDescription>Two images exceed the 2MB limit. Replace them and retry.</AlertDescription>
    </Alert>
  ),
};

/** `AlertAction` keeps the response inside the message instead of below it. */
export const WithAction: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Update available</AlertTitle>
      <AlertDescription>A new version of the CLI is ready to install.</AlertDescription>
      <AlertAction>
        <button type="button" className="text-sm font-medium underline underline-offset-4">
          Update
        </button>
      </AlertAction>
    </Alert>
  ),
};
