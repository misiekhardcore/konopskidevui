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

const preview: Preview = {
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
