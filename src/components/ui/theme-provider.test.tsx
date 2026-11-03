import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ThemeProvider, useTheme } from './theme-provider';

function ThemeReadout() {
  const { theme, resolvedTheme } = useTheme();

  return <output>{`${theme}/${resolvedTheme}`}</output>;
}

afterEach(() => {
  document.documentElement.className = '';
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
});

describe('ThemeProvider', () => {
  it('defaults to the dark class attribute and the system theme', () => {
    render(
      <ThemeProvider>
        <ThemeReadout />
      </ThemeProvider>,
    );

    // jsdom reports a light page, so `system` resolves to `light`.
    expect(screen.getByRole('status')).toHaveTextContent('system/light');
    expect(document.documentElement).toHaveClass('light');
  });

  it('applies a forced theme without changing the stored one', () => {
    render(
      <ThemeProvider forcedTheme="dark">
        <ThemeReadout />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveClass('dark');
    // `forcedTheme` paints `<html>`; next-themes leaves the stored choice (and
    // what it resolved to) alone, so a forced preview never overwrites a pick.
    expect(screen.getByRole('status')).toHaveTextContent('system/light');
  });

  it('forwards the attribute and default theme to next-themes', () => {
    render(
      <ThemeProvider attribute="data-theme" defaultTheme="dark">
        <ThemeReadout />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement).not.toHaveClass('dark');
    expect(screen.getByRole('status')).toHaveTextContent('dark/dark');
  });
});
