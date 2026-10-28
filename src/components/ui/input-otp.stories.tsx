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

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};
