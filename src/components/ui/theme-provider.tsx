import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

import type { ComponentProps } from 'react';

/**
 * The konopskidev house theme: the `.dark` class on `<html>`, `system` as the
 * first-run default, and transitions suppressed while the class flips so a
 * theme change never animates every colour on the page at once.
 *
 * Every other prop is forwarded to `next-themes`, which owns the storage key,
 * the allowed theme list and the flash-of-wrong-theme script. Mount it once near
 * the app root; `<ThemeSwitcher />` reads and writes the store it creates, and
 * `Toaster` follows the `.dark` class it writes.
 *
 * The app still owns one line `next-themes` cannot provide from inside a
 * component: `suppressHydrationWarning` on the `<html>` element, because the
 * inline script has already set its class before React hydrates.
 */
function ThemeProvider({
  attribute = 'class',
  defaultTheme = 'system',
  disableTransitionOnChange = true,
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * The theme state the nearest `ThemeProvider` holds. Re-exported from
 * `next-themes` so a consumer imports the provider, the hook and the switcher
 * from one package instead of pairing this one with a separate `next-themes`
 * import.
 */
const useTheme = useNextTheme;

export { ThemeProvider, useTheme };
