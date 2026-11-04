import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { ThemeProvider } from './theme-provider';
import { ThemeSwitcher } from './theme-switcher';

import type { ComponentProps } from 'react';

function renderSwitcher(props: ComponentProps<typeof ThemeSwitcher> = {}) {
  return render(
    <ThemeProvider defaultTheme="system">
      <ThemeSwitcher {...props} />
    </ThemeProvider>,
  );
}

afterEach(() => {
  document.documentElement.className = '';
  localStorage.clear();
});

describe('ThemeSwitcher', () => {
  it('renders one option per theme, all in one group', () => {
    renderSwitcher();

    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radiogroup', { name: 'Color theme' })).toBeInTheDocument();
  });

  it('presses the theme the provider currently holds', () => {
    renderSwitcher();

    expect(screen.getByRole('radio', { name: 'System' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Light' })).toHaveAttribute('aria-checked', 'false');
  });

  it('switches the document class when an option is clicked', async () => {
    renderSwitcher();

    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(screen.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('keeps the pressed option when it is clicked again', async () => {
    renderSwitcher();

    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    // A single ToggleGroup reports an empty value on the second click; the
    // control must ignore it rather than render with nothing pressed.
    expect(screen.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('overrides the names it is given and keeps the rest', () => {
    renderSwitcher({ labels: { dark: 'Ciemny' }, 'aria-label': 'Motyw' });

    expect(screen.getByRole('radiogroup', { name: 'Motyw' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Ciemny' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Light' })).toBeInTheDocument();
  });

  it('presses the fallback theme when there is no provider', () => {
    render(<ThemeSwitcher />);

    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'System' })).toHaveAttribute('aria-checked', 'true');
  });

  it('accepts a fallback theme that matches a non-system provider default', () => {
    render(<ThemeSwitcher fallbackTheme="dark" />);

    expect(screen.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'System' })).toHaveAttribute('aria-checked', 'false');
  });

  it('shows the visible labels on request', () => {
    renderSwitcher({ showLabels: true });

    expect(screen.getByRole('radio', { name: 'Light' })).toHaveTextContent('Light');
    expect(screen.getByRole('radio', { name: 'System' })).toHaveTextContent('System');
    expect(screen.getByRole('radio', { name: 'Dark' })).toHaveTextContent('Dark');
  });

  it('defaults to the house control height and can be made compact', () => {
    const { rerender } = renderSwitcher();

    for (const item of screen.getAllByRole('radio')) expect(item).toHaveClass('h-10');

    rerender(
      <ThemeProvider defaultTheme="system">
        <ThemeSwitcher size="sm" />
      </ThemeProvider>,
    );

    for (const item of screen.getAllByRole('radio')) expect(item).toHaveClass('h-8');
  });

  it('passes the group size and variant through', () => {
    renderSwitcher({ size: 'lg', variant: 'default' });

    const group = screen.getByRole('radiogroup', { name: 'Color theme' });

    expect(group).toHaveAttribute('data-size', 'lg');
    expect(group).toHaveAttribute('data-variant', 'default');
  });
});
