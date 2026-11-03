import { useEffect, useRef } from 'react';

import { ThemeProvider, useTheme } from '../src/components/ui/theme-provider';

import type { Preview } from '@storybook/react-vite';

// The same four families the site loads with `next/font`. They are a
// devDependency only: consuming apps bring their own fonts.
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/lora/400.css';
import '@fontsource/lora/400-italic.css';
import '@fontsource/jetbrains-mono/400.css';

import './preview.css';

const isEmptyMember = (value: unknown) => value === null || value === undefined;

// `VariantProps` from class-variance-authority types every variant as
// `… | null`, and `shouldRemoveUndefinedFromOptional` only drops the
// `undefined`. Docgen therefore reports a `null` union member, which surfaces
// as an empty choice in each control and as `null` in the type column of the
// props table. Strip it before `inferControls` builds `options` from
// `type.value`, so the component's type stays the single source of truth.
const withoutEmptyEnumValues: NonNullable<Preview['argTypesEnhancers']>[number] = ({
  argTypes,
}) => {
  const next = { ...argTypes };

  for (const [name, argType] of Object.entries(argTypes)) {
    if (argType?.type?.name !== 'enum') continue;

    const summary = argType.table?.type?.summary;

    next[name] = {
      ...argType,
      type: {
        ...argType.type,
        value: argType.type.value?.filter((value) => !isEmptyMember(value)),
      },
      // The docs table renders this precomputed union instead of `type.value`.
      ...(typeof summary === 'string' && {
        table: {
          ...argType.table,
          type: {
            ...argType.table?.type,
            summary: summary
              .split(' | ')
              .filter((member) => member !== 'null' && member !== 'undefined')
              .join(' | '),
          },
        },
      }),
    };
  }

  return next;
};

/**
 * Pushes a toolbar change into next-themes, so the toolbar and every
 * `<ThemeSwitcher />` inside a story drive the same store instead of two
 * different ones writing `<html>` behind each other's back. The first render is
 * skipped: the provider already started on the toolbar's value, and re-setting
 * it on mount would undo a choice a play function made moments later.
 */
function ThemeSync({ theme }: { theme: string }) {
  const { setTheme } = useTheme();
  const applied = useRef(theme);

  useEffect(() => {
    if (applied.current === theme) return;

    applied.current = theme;
    setTheme(theme);
  }, [setTheme, theme]);

  return null;
}

const preview: Preview = {
  argTypesEnhancers: [withoutEmptyEnumValues],
  globalTypes: {
    theme: {
      description: 'Token set for the preview; the same next-themes store the components read',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'system', title: 'System' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    // `@custom-variant dark (&:is(.dark *))` needs the class on an ancestor, so
    // the library provider puts it on <html>, exactly as an app does. Using the
    // package's own provider here means every story exercises the same wiring a
    // consumer gets, rather than a Storybook-only approximation of it.
    (Story, context) => {
      // The vitest runner renders stories without the manager's globals, so the
      // toolbar default is repeated here rather than assumed.
      const theme = context.globals.theme ?? 'light';

      return (
        // One storage key per story, so a theme a play function picked cannot
        // leak into the next story's first render.
        <ThemeProvider
          attribute="class"
          defaultTheme={theme}
          enableSystem
          storageKey={`storybook-theme-${context.id}`}
        >
          <ThemeSync theme={theme} />
          <div className="bg-background font-sans text-base text-foreground">
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    controls: {
      expanded: true,
      sort: 'requiredFirst',
      matchers: {
        color: /(background|color|token)$/i,
        date: /Date$/i,
      },
    },
    // Any axe violation fails `pnpm test:stories`.
    a11y: { test: 'error' },
    // Chromatic snapshots one composition per component, not all of them: the
    // opt-in is the story that sets `disableSnapshot: false` (the guard in
    // `src/story-coverage.test.ts` keeps every component to at least one).
    chromatic: { disableSnapshot: true },
    docs: { toc: true },
    options: {
      storySort: {
        order: ['Foundations', 'Components', 'Recipes'],
      },
    },
  },
};

export default preview;
