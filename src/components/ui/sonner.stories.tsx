import { toast } from 'sonner';

import { Button } from './button';
import { Toaster } from './sonner';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Sonner',
  component: Toaster,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Transient feedback, mounted once near the app root. The theme is a prop rather than a theme-provider lookup, so the library has no `next-themes` dependency: pass your theme down or leave it on `system`.',
      },
    },
  },
  argTypes: {
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark', 'system'],
      description: 'Token set used for the toast surface.',
      table: { category: 'Appearance', defaultValue: { summary: 'system' } },
    },
    position: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
      table: { category: 'Layout', defaultValue: { summary: 'bottom-right' } },
    },
    duration: {
      control: { type: 'number', min: 1000, max: 20000, step: 500 },
      description: 'Milliseconds before a toast dismisses itself.',
      table: { category: 'Behaviour' },
    },
    closeButton: { control: 'boolean', table: { category: 'Appearance' } },
    richColors: { control: 'boolean', table: { category: 'Appearance' } },
  },
  args: { theme: 'system', position: 'bottom-right', closeButton: false, richColors: false },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => toast('Draft saved')}>
          Plain toast
        </Button>
        <Button variant="outline" onClick={() => toast.success('Article published')}>
          Success
        </Button>
        <Button variant="outline" onClick={() => toast.error('Could not reach the API')}>
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast('Article deleted', {
              action: { label: 'Undo', onClick: () => toast.success('Restored') },
            })
          }
        >
          With action
        </Button>
      </div>
    </>
  ),
};

export const WithCloseButton: Story = {
  args: { closeButton: true },
  render: Default.render,
};
