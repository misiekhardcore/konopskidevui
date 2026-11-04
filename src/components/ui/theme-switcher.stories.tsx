import { expect, userEvent } from 'storybook/test';

import { ThemeSwitcher } from './theme-switcher';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/ThemeSwitcher',
  component: ThemeSwitcher,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The three-state theme control: Light, System and Dark as one segmented toggle group. It reads and writes the nearest next-themes provider instead of taking a value, so the choice is the same one every `useTheme()` call sees and the `.dark` class it writes is what `Toaster` follows. Mount `ThemeProvider` once near the app root; the group brings its own tooltip provider.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'outline'],
      description: 'Surface treatment of the joined items.',
      table: { category: 'Appearance', defaultValue: { summary: 'outline' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
      description: 'Height of every item in the group.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    labels: {
      control: 'object',
      description:
        'Names for the tooltip and the accessible label, per option. Omitted keys keep the English default.',
      table: { category: 'Content' },
    },
    fallbackTheme: {
      control: 'inline-radio',
      options: ['light', 'system', 'dark'],
      description:
        'Pressed option until the provider reports a theme. Match it to `ThemeProvider` when that is not `system`.',
      table: { category: 'State', defaultValue: { summary: 'system' } },
    },
    showLabels: {
      control: 'boolean',
      description: 'Show each option’s name next to its icon, for touch and drawer rows.',
      table: { category: 'Content', defaultValue: { summary: 'false' } },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    'aria-label': {
      control: 'text',
      description: 'Accessible name of the group itself.',
      table: { category: 'Accessibility', defaultValue: { summary: 'Color theme' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    variant: 'outline',
    size: 'default',
    fallbackTheme: 'system',
    showLabels: false,
    disabled: false,
  },
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  globals: { theme: 'system' },
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => <ThemeSwitcher {...args} />,
};

/** The same control with the dark tokens applied, as a dark page shows it. */
export const DarkSelected: Story = {
  globals: { theme: 'dark' },
  render: Default.render,
};

/** `labels` translates the tooltip, the accessible name and the visible text together. */
export const CustomLabels: Story = {
  args: { labels: { light: 'Jasny', system: 'Systemowy', dark: 'Ciemny' } },
  render: (args) => <ThemeSwitcher {...args} aria-label="Motyw" />,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};

/** `showLabels` puts the names on the surface, so touch does not need a tooltip. */
export const Labelled: Story = {
  args: { showLabels: true },
  render: (args) => (
    <div className="flex w-fit flex-col gap-2">
      <span className="eyebrow">Theme</span>
      <ThemeSwitcher {...args} />
    </div>
  ),
};

/** Clicking a pressed option keeps it pressed instead of clearing the group. */
export const Interaction: Story = {
  render: Default.render,
  play: async ({ canvas }) => {
    const light = canvas.getByRole('radio', { name: 'Light' });
    const dark = canvas.getByRole('radio', { name: 'Dark' });

    await expect(light).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(dark);
    await expect(dark).toHaveAttribute('aria-checked', 'true');
    await expect(light).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(dark);
    await expect(dark).toHaveAttribute('aria-checked', 'true');
  },
};
