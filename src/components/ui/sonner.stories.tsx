import { Button } from './button';
import { Toaster, toast } from './sonner';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Sonner',
  component: Toaster,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Transient feedback, mounted once near the app root. The toaster follows the nearest `ThemeProvider`, so it flips with `ThemeSwitcher` without a prop; pass `theme` to pin one surface to a token set of its own.',
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
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
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

/** `theme` overrides the provider for the toaster alone. */
export const DarkTheme: Story = {
  args: { theme: 'dark' },
  render: Default.render,
};

/** `richColors` tints success and error toasts instead of keeping them neutral. */
export const RichColors: Story = {
  args: { richColors: true },
  render: Default.render,
};
