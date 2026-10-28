import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Input } from './input';

describe('Input', () => {
  it('renders a text field with its placeholder', () => {
    render(<Input placeholder="you@example.com" />);

    // House rule: optional fields label themselves in the placeholder.
    expect(screen.getByPlaceholderText('you@example.com (optional)')).toBeInTheDocument();
  });

  it('appends “(optional)” to a placeholder unless the field is required', () => {
    const { rerender } = render(<Input placeholder="Phone" />);
    expect(screen.getByPlaceholderText('Phone (optional)')).toBeInTheDocument();

    rerender(<Input placeholder="Phone" required />);
    expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument();
  });

  it('renders the error message and marks the field invalid', () => {
    render(<Input placeholder="Email" error="Enter a valid email address." />);

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email (optional)')).toHaveAttribute('aria-invalid', 'true');
  });

  it('uses the house control height, radius and focus treatment', () => {
    render(<Input placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email (optional)');

    expect(input.className).toContain('h-10');
    expect(input.className).toContain('rounded-sm');
    expect(input.className).toContain('focus-ring');
    expect(input.className).toContain('bg-background');
  });

  it('accepts typing', async () => {
    render(<Input placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email (optional)');

    await userEvent.type(input, 'hello@konopski.dev');

    expect(input).toHaveValue('hello@konopski.dev');
  });

  it('is disabled when asked', () => {
    render(<Input placeholder="Email" disabled />);

    expect(screen.getByPlaceholderText('Email (optional)')).toBeDisabled();
  });

  it('forwards a ref to the underlying input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="Email" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
