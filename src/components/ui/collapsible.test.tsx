import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';

function renderCollapsible(props: React.ComponentProps<typeof Collapsible> = {}) {
  return render(
    <Collapsible {...props}>
      <CollapsibleTrigger>Toggle details</CollapsibleTrigger>
      <CollapsibleContent>The build takes about four minutes.</CollapsibleContent>
    </Collapsible>,
  );
}

describe('Collapsible', () => {
  it('starts closed and says so on the trigger', () => {
    renderCollapsible();

    expect(screen.getByRole('button', { name: 'Toggle details' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByText('The build takes about four minutes.')).not.toBeInTheDocument();
  });

  it('opens on click and marks the content as the trigger’s region', async () => {
    renderCollapsible();

    const trigger = screen.getByRole('button', { name: 'Toggle details' });
    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const content = screen.getByText('The build takes about four minutes.');
    expect(trigger).toHaveAttribute('aria-controls', content.id);
  });

  it('closes again on the second click', async () => {
    renderCollapsible({ defaultOpen: true });

    const trigger = screen.getByRole('button', { name: 'Toggle details' });
    expect(screen.getByText('The build takes about four minutes.')).toBeInTheDocument();

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not change while disabled', async () => {
    renderCollapsible({ disabled: true });

    const trigger = screen.getByRole('button', { name: 'Toggle details' });
    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
