import { withThemeByClassName } from '@storybook/addon-themes';

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

const preview: Preview = {
  argTypesEnhancers: [withoutEmptyEnumValues],
  decorators: [
    // `@custom-variant dark (&:is(.dark *))` needs the class on an ancestor, so
    // it goes on <html> exactly as next-themes would put it in a real app.
    withThemeByClassName({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
    (Story) => (
      <div className="bg-background font-sans text-base text-foreground">
        <Story />
      </div>
    ),
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
    docs: { toc: true },
    options: {
      storySort: {
        order: ['Foundations', 'Components', 'Recipes'],
      },
    },
  },
};

export default preview;
