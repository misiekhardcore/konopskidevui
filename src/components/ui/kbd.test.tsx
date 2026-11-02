import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Kbd, KbdGroup } from './kbd';

describe('Kbd', () => {
  it('renders a real <kbd>, so the key is announced as one', () => {
    render(<Kbd>K</Kbd>);

    expect(screen.getByText('K').tagName).toBe('KBD');
  });

  it('groups a shortcut without adding a second landmark', () => {
    const { container } = render(
      <p>
        Open the palette
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </p>,
    );

    const group = container.querySelector('[data-slot="kbd-group"]');
    expect(group?.tagName).toBe('KBD');
    expect(group?.querySelectorAll('[data-slot="kbd"]')).toHaveLength(2);
  });

  it('passes its element through, so a tooltip can style it in place', () => {
    render(
      <Kbd data-slot-test="in-tooltip" className="bg-background/20">
        Esc
      </Kbd>,
    );

    const key = screen.getByText('Esc');
    expect(key).toHaveAttribute('data-slot-test', 'in-tooltip');
    expect(key.className).toContain('bg-background/20');
  });
});
