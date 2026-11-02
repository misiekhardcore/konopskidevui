import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './input-otp';

import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * The root is a discriminated union (`render` or `children`), so this meta is
 * intentionally untyped against the component; the args are read explicitly in
 * the render functions below.
 */
const meta: Meta = {
  title: 'Components/Input OTP',
  component: InputOTP,
  subcomponents: { InputOTPGroup, InputOTPSlot, InputOTPSeparator },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A one-time-code field split into visible slots. Paste works, and the underlying input keeps mobile numeric keyboards and password managers working.',
      },
    },
  },
  argTypes: {
    maxLength: {
      control: { type: 'number', min: 1, max: 8 },
      description: 'Number of digits.',
      table: { category: 'Behaviour' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    pattern: {
      control: 'text',
      description: 'Regex the value must match, e.g. `^[0-9]+$`.',
      table: { category: 'Validation' },
    },
    containerClassName: { control: 'text', table: { category: 'Styling' } },
  },
  args: { maxLength: 6, disabled: false },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <InputOTP
      aria-label="Verification code"
      maxLength={Number(args.maxLength)}
      disabled={Boolean(args.disabled)}
      pattern={args.pattern}
      containerClassName={args.containerClassName}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const FourDigits: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <InputOTP aria-label="Verification code" maxLength={4}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

/** `InputOTPSeparator` is decorative; it takes no props, so it has no controls. */
export const WithSeparator: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <InputOTP aria-label="Gift card code" maxLength={8}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
        <InputOTPSlot index={6} />
        <InputOTPSlot index={7} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

/** A `pattern` is the only validation the field does itself; letters are rejected here. */
export const Alphanumeric: Story = {
  args: { pattern: '^[A-Z0-9]+$', maxLength: 6 },
  render: Default.render,
};

/** An invalid code is two attributes: `aria-invalid` on the field, and the message below. */
export const Invalid: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-2">
      <InputOTP aria-label="Verification code" maxLength={6} defaultValue="000000" aria-invalid>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <p className="text-sm font-bold text-destructive">That code is expired.</p>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};
