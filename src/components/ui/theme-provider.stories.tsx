import { ThemeProvider, useTheme } from './theme-provider';

import type { Meta, StoryObj } from '@storybook/react-vite';

function ThemeReadout() {
  const { theme, resolvedTheme, forcedTheme } = useTheme();

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 font-mono text-xs">
      <dt className="text-muted-foreground">theme</dt>
      <dd className="text-foreground">{theme ?? '—'}</dd>
      <dt className="text-muted-foreground">resolvedTheme</dt>
      <dd className="text-foreground">{resolvedTheme ?? '—'}</dd>
      <dt className="text-muted-foreground">forcedTheme</dt>
      <dd className="text-foreground">{forcedTheme ?? '—'}</dd>
    </dl>
  );
}

const meta = {
  title: 'Components/ThemeProvider',
  component: ThemeProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`next-themes` with the konopskidev defaults: `.dark` on `<html>`, `system` on first run, and transitions off while the class flips. Everything else is forwarded, so the storage key, the allowed themes and a forced theme stay available. Mount it once near the app root — `ThemeSwitcher` and `Toaster` both read the store it creates. The app still needs `suppressHydrationWarning` on `<html>`, because the inline script has already set the class by the time React hydrates.',
      },
    },
  },
  argTypes: {
    attribute: {
      control: 'inline-radio',
      options: ['class', 'data-theme'],
      description: 'Where the theme is written. `class` is what the `.dark` variant reads.',
      table: { category: 'Appearance', defaultValue: { summary: 'class' } },
    },
    defaultTheme: {
      control: 'text',
      description: 'Theme used before anybody has chosen one.',
      table: { category: 'Behaviour', defaultValue: { summary: 'system' } },
    },
    forcedTheme: {
      control: 'text',
      description: 'Pins the applied theme without changing the stored one.',
      table: { category: 'Behaviour' },
    },
    enableSystem: {
      control: 'boolean',
      description: 'Offers `system` and follows `prefers-color-scheme`.',
      table: { category: 'Behaviour', defaultValue: { summary: 'true' } },
    },
    disableTransitionOnChange: {
      control: 'boolean',
      description: 'Suppresses CSS transitions for the frame the class changes.',
      table: { category: 'Behaviour', defaultValue: { summary: 'true' } },
    },
    storageKey: {
      control: 'text',
      table: { category: 'Behaviour', defaultValue: { summary: 'theme' } },
    },
    themes: { control: 'object', table: { category: 'Behaviour' } },
  },
  args: {
    attribute: 'class',
    defaultTheme: 'system',
    enableSystem: true,
    disableTransitionOnChange: true,
  },
} satisfies Meta<typeof ThemeProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <ThemeProvider {...args}>
      <div className="w-80 rounded-sm border border-input bg-card p-4 text-card-foreground">
        <p className="font-sans text-sm font-medium">Article published</p>
        <p className="mt-1 text-xs text-muted-foreground">
          The toaster and every `useTheme()` call read this store.
        </p>
        <div className="mt-4">
          <ThemeReadout />
        </div>
      </div>
    </ThemeProvider>
  ),
};

/** `forcedTheme` pins what the page renders, for a preview iframe or an embed. */
export const ForcedTheme: Story = {
  args: { forcedTheme: 'dark' },
  render: Default.render,
};

/**
 * `attribute` is forwarded: `data-theme` writes an attribute instead of a
 * class, which is what a stylesheet keyed on `[data-theme]` expects.
 */
export const DataAttribute: Story = {
  args: { attribute: 'data-theme', defaultTheme: 'dark' },
  render: Default.render,
};
