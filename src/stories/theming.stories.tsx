import type { Meta, StoryObj } from '@storybook/react-vite';

import { useTheme } from '@/components/ui/theme-provider';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

function ThemeState() {
  const { theme, resolvedTheme } = useTheme();

  return (
    <p className="font-mono text-xs text-muted-foreground">
      theme: {theme ?? '—'} · resolvedTheme: {resolvedTheme ?? '—'}
    </p>
  );
}

const meta = {
  title: 'Foundations/Theming',
  parameters: {
    docs: {
      description: {
        component: [
          'One theme store for the whole library. `next-themes` holds it, `ThemeProvider` gives it the konopskidev defaults and writes `.dark` onto `<html>`, and `ThemeSwitcher` changes it. `Toaster` follows that `.dark` class and any `useTheme()` call reads the store, so a page never ends up half dark.',
          '',
          '```tsx',
          "import { ThemeProvider, ThemeSwitcher } from '@konopskidev/ui';",
          '',
          '// app root, once',
          '<ThemeProvider>',
          '  <App />',
          '</ThemeProvider>',
          '',
          '// wherever the control belongs',
          '<ThemeSwitcher />',
          '```',
          '',
          '`next-themes` is a peer dependency, so the app installs it next to this package and both share one instance. The `<html>` element needs `suppressHydrationWarning`, because the inline script sets the class before React hydrates.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** The switcher in the header it lives in, with the state it just wrote. */
export const Setup: Story = {
  render: () => (
    <div className="w-[36rem] overflow-hidden rounded-sm border border-input bg-background">
      <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-semibold text-foreground">
            Traveling Salesman
          </p>
          <p className="truncate text-xs text-muted-foreground">
            A genetic algorithm evolving the shortest route through 24 points
          </p>
        </div>
        <ThemeSwitcher size="sm" />
      </div>
      <div className="space-y-2 p-4">
        <p className="text-sm text-foreground">
          Pick an option above and this line follows it, with no props passed between them.
        </p>
        <ThemeState />
      </div>
    </div>
  ),
};

/** Both token sets side by side. The wrapper owns the variables `.dark` sets. */
export const LightAndDark: Story = {
  render: () => (
    <div className="grid w-[36rem] grid-cols-2 gap-4">
      <div className="rounded-sm border border-input bg-background p-4 text-foreground">
        <p className="font-sans text-sm font-medium">Light tokens</p>
        <p className="mt-1 text-xs text-muted-foreground">
          The palette every component uses by default.
        </p>
        <div className="mt-4 rounded-sm bg-card p-3 text-card-foreground">
          <p className="text-xs text-muted-foreground">Card surface</p>
        </div>
      </div>
      <div className="dark rounded-sm border border-input bg-background p-4 text-foreground">
        <p className="font-sans text-sm font-medium">Dark tokens</p>
        <p className="mt-1 text-xs text-muted-foreground">
          `.dark` on the wrapper sets the variables for itself and everything inside.
        </p>
        <div className="mt-4 rounded-sm bg-card p-3 text-card-foreground">
          <p className="text-xs text-muted-foreground">Card surface</p>
        </div>
      </div>
    </div>
  ),
};

/** `labels` translates the tooltip and the accessible name together. */
export const CustomLabels: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <ThemeSwitcher labels={{ light: 'Jasny', system: 'Systemowy', dark: 'Ciemny' }} />
      <ThemeState />
    </div>
  ),
};
