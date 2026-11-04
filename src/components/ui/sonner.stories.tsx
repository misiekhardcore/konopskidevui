import { expect, within } from 'storybook/test';

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
          "Transient feedback, mounted once near the app root. The toast follows the page tokens and the `.dark` class like every other component, so it flips with `ThemeSwitcher` without a prop or a provider. Pass `theme` to opt one surface into sonner's own palette instead.",
      },
    },
  },
  argTypes: {
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark', 'system'],
      description: "Opt out of the page skin and use sonner's own palette for this surface.",
      table: { category: 'Appearance', defaultValue: { summary: 'page' } },
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
  args: { position: 'bottom-right', closeButton: false, richColors: false },
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

/** `theme` opts this toaster out of the page tokens and into sonner's palette. */
export const OwnPalette: Story = {
  args: { theme: 'dark' },
  render: Default.render,
};

/** `richColors` tints success and error toasts with sonner's own palette. */
export const RichColors: Story = {
  args: { richColors: true },
  render: Default.render,
};

/**
 * The page skin on a dark page: the surface, the description and the close
 * button all come from the dark tokens, with no provider and no `theme` prop.
 */
export const PageTheme: Story = {
  globals: { theme: 'dark' },
  render: Default.render,
  play: async () => {
    toast('Draft saved', { description: 'Synced to the server' });

    const body = within(document.body);
    await body.findByText('Draft saved');

    const toastEl = document.querySelector('[data-sonner-toast]');
    const description = document.querySelector('[data-description]');

    expect(toastEl).not.toBeNull();
    expect(description).not.toBeNull();

    // `--popover` and `--muted-foreground` from the dark token block.
    expect(getComputedStyle(toastEl!).backgroundColor).toBe('rgb(23, 28, 33)');
    expect(getComputedStyle(description!).color).toBe('rgb(152, 162, 172)');
  },
};
