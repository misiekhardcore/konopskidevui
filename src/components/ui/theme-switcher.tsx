'use client';

import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import * as React from 'react';

import { useTheme } from './theme-provider';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'system', label: 'System', Icon: MonitorIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
] as const;

export type ThemeValue = (typeof THEME_OPTIONS)[number]['value'];

interface ThemeSwitcherProps extends Omit<
  React.ComponentProps<typeof ToggleGroup>,
  'type' | 'value' | 'defaultValue' | 'onValueChange' | 'spacing'
> {
  /**
   * Names shown in the tooltip and read by a screen reader, per option.
   * Omitted keys keep the English defaults, so a translated app overrides only
   * the ones it needs.
   */
  labels?: Partial<Record<ThemeValue, string>>;
  /**
   * Theme shown as pressed until the provider reports one. Match it to the
   * `ThemeProvider`'s `defaultTheme` when that is not `system`, so the control
   * does not change its pressed option on hydration.
   */
  fallbackTheme?: ThemeValue;
  /**
   * Render each option's label next to its icon instead of relying on the
   * tooltip, for a touch target or a drawer row.
   */
  showLabels?: boolean;
}

/**
 * The three-state theme control: Light, System and Dark in one segmented
 * toggle group.
 *
 * The value is not a prop — the component reads and writes the nearest
 * next-themes provider, so a theme chosen here is the same one every
 * `useTheme()` call sees and the `.dark` class it writes is what `Toaster`
 * follows. Mount `ThemeProvider` once near the app root and render this
 * anywhere below it.
 *
 * The group carries its own tooltip provider, so it does not depend on the app
 * mounting one for its labels.
 */
function ThemeSwitcher({
  variant = 'outline',
  size = 'default',
  labels,
  fallbackTheme = 'system',
  showLabels = false,
  className,
  'aria-label': ariaLabel = 'Color theme',
  ...props
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider>
      <ToggleGroup
        aria-label={ariaLabel}
        type="single"
        variant={variant}
        size={size}
        spacing={0}
        value={theme ?? fallbackTheme}
        // A single ToggleGroup reports `''` when the pressed item is clicked
        // again. Ignoring that empty value keeps one theme always pressed
        // instead of letting the control render in no state at all.
        onValueChange={(value) => value && setTheme(value)}
        className={className}
        {...props}
      >
        {THEME_OPTIONS.map(({ value, label, Icon }) => {
          const name = labels?.[value] ?? label;

          return (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <ToggleGroupItem value={value} aria-label={name} suppressHydrationWarning>
                  <Icon aria-hidden />
                  {showLabels ? <span>{name}</span> : null}
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>{name}</TooltipContent>
            </Tooltip>
          );
        })}
      </ToggleGroup>
    </TooltipProvider>
  );
}

export { ThemeSwitcher };
