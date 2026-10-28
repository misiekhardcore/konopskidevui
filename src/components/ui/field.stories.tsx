import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
} from './field';
import { Input } from './input';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Field',
  component: Field,
  tags: ['autodocs'],
  subcomponents: {
    FieldLabel,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldContent,
    FieldTitle,
  },
  parameters: {
    docs: {
      description: {
        component:
          'The layout of one labelled control: label, control, description and error, wired together with the right `aria-describedby`. The correct default for any form.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal', 'responsive'],
      description: 'Stacked label above the control, or beside it.',
      table: { category: 'Layout' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    orientation: 'vertical',
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <FieldSet className="w-80">
        <FieldLegend>Account</FieldLegend>
        <FieldGroup>
          <Field {...args}>
            <FieldLabel htmlFor="field-email">Email</FieldLabel>
            <Input id="field-email" type="email" placeholder="you@example.com" />
            <FieldDescription>We only email about releases.</FieldDescription>
          </Field>
          <Field data-invalid="true">
            <FieldLabel htmlFor="field-broken">API key</FieldLabel>
            <Input id="field-broken" aria-invalid defaultValue="sk-broken" />
            <FieldError errors={[{ message: 'This key expired in March.' }]} />
          </Field>
        </FieldGroup>
      </FieldSet>
    </>
  ),
};
