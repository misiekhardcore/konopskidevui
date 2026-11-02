import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Input } from './input';
import { Label } from './label';

describe('Label', () => {
  it('names the control it is wired to', () => {
    render(
      <>
        <Label htmlFor="title">Article title</Label>
        <Input id="title" />
      </>,
    );

    expect(screen.getByLabelText('Article title')).toBeInTheDocument();
  });

  it('focuses the control on click, which is the whole point of `htmlFor`', async () => {
    render(
      <>
        <Label htmlFor="title">Article title</Label>
        <Input id="title" />
      </>,
    );

    await userEvent.click(screen.getByText('Article title'));

    expect(screen.getByRole('textbox', { name: 'Article title' })).toHaveFocus();
  });

  it('renders as a label element, never a div', () => {
    render(<Label htmlFor="title">Article title</Label>);

    expect(screen.getByText('Article title').tagName).toBe('LABEL');
  });
});
