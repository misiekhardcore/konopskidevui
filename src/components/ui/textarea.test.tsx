import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renders a multi-line field', () => {
    render(<Textarea placeholder="Notes" />);

    expect(screen.getByPlaceholderText('Notes (optional)').tagName).toBe('TEXTAREA');
  });

  it('accepts typing', async () => {
    render(<Textarea placeholder="Notes" />);
    const field = screen.getByPlaceholderText('Notes (optional)');

    await userEvent.type(field, 'Two lines');

    expect(field).toHaveValue('Two lines');
  });

  it('renders an error and marks the field invalid', () => {
    render(<Textarea placeholder="Notes" error="Required" />);

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Notes (optional)')).toHaveAttribute('aria-invalid', 'true');
  });

  it('uses the house field treatment', () => {
    render(<Textarea placeholder="Notes" />);
    const field = screen.getByPlaceholderText('Notes (optional)');

    expect(field.className).toContain('min-h-20');
    expect(field.className).toContain('rounded-sm');
    expect(field.className).toContain('focus-ring');
  });

  it('sizes itself to the content when autoHeight is set', () => {
    render(<Textarea placeholder="Notes" autoHeight defaultValue="line" />);
    const field = screen.getByPlaceholderText('Notes (optional)') as HTMLTextAreaElement;

    // jsdom reports scrollHeight as 0, so the assertion is that the inline height is set.
    expect(field.style.height).toBe('0px');
    expect(field.className).toContain('resize-none');
  });

  it('forwards a ref to the underlying field', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} placeholder="Notes" />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
