import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { InputOTP, InputOTPGroup, InputOTPSlot } from './input-otp';

function renderOtp() {
  return render(
    <InputOTP maxLength={4} aria-label="One-time code">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>,
  );
}

describe('InputOTP', () => {
  it('renders one slot per digit', () => {
    renderOtp();

    expect(document.querySelectorAll('[data-slot="input-otp-slot"]')).toHaveLength(4);
  });

  it('accepts typed digits', async () => {
    const { container } = renderOtp();
    const input = container.querySelector('input');
    if (!input) throw new Error('expected the hidden OTP input');

    await userEvent.type(input, '1234');

    expect(input).toHaveValue('1234');
  });

  it('accepts a pasted code', async () => {
    const { container } = renderOtp();
    const input = container.querySelector('input');
    if (!input) throw new Error('expected the hidden OTP input');

    await userEvent.click(input);
    await userEvent.paste('9876');

    expect(input).toHaveValue('9876');
  });

  it('caps input at maxLength', async () => {
    const { container } = renderOtp();
    const input = container.querySelector('input');
    if (!input) throw new Error('expected the hidden OTP input');

    await userEvent.type(input, '123456');

    expect(input).toHaveValue('1234');
  });

  it('draws a blinking caret in the slot the user is typing into', async () => {
    renderOtp();

    await userEvent.click(screen.getByLabelText('One-time code'));

    const active = document.querySelector('[data-slot="input-otp-slot"][data-active="true"]');
    expect(active?.querySelector('.animate-caret-blink')).not.toBeNull();
  });

  it('renders the group as a labelled control', () => {
    renderOtp();

    expect(screen.getByLabelText('One-time code')).toBeInTheDocument();
  });
});
