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
      description:
        'Stacked label above the control, beside it, or beside it only once the field group is wide enough.',
      table: { category: 'Layout', defaultValue: { summary: 'vertical' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    orientation: 'vertical',
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A part's props reach the Controls panel only through its own story. */
const legendMeta = { component: FieldLegend } as const satisfies Partial<Meta<typeof FieldLegend>>;
const separatorMeta = { component: FieldSeparator } as const satisfies Partial<
  Meta<typeof FieldSeparator>
>;
const errorMeta = { component: FieldError } as const satisfies Partial<Meta<typeof FieldError>>;

export const Default: Story = {
  render: (args) => (
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
  ),
};

/** `horizontal` puts the label beside the control; the control keeps the remaining width. */
export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <FieldSet className="w-96">
      <FieldGroup>
        <Field {...args}>
          <FieldLabel htmlFor="field-horizontal">Display name</FieldLabel>
          <Input id="field-horizontal" placeholder="Misiek" />
        </Field>
        <Field {...args}>
          <FieldLabel htmlFor="field-horizontal-toggle">Use system theme</FieldLabel>
          <Input id="field-horizontal-toggle" type="checkbox" aria-label="Use system theme" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

/** `responsive` is vertical until the field group's container query crosses `@md`. */
export const Responsive: Story = {
  args: { orientation: 'responsive' },
  render: (args) => (
    <FieldSet className="w-full max-w-2xl">
      <FieldGroup>
        <Field {...args}>
          <FieldLabel htmlFor="field-responsive">Workspace slug</FieldLabel>
          <Input id="field-responsive" placeholder="konopskidev" />
          <FieldDescription>
            Narrow the preview to see the label move above the control.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

/** `FieldLegend` is a legend by default; `variant="label"` is the inline form heading. */
export const Legend: StoryObj<typeof legendMeta> = {
  args: { variant: 'legend', children: 'Account' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['legend', 'label'],
      description: '`legend` is the 16px group heading, `label` the 14px inline one.',
      table: { category: 'Appearance', defaultValue: { summary: 'legend' } },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <FieldSet className="w-80">
      <FieldLegend {...args}>{children}</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="field-legend">Email</FieldLabel>
          <Input id="field-legend" placeholder="you@example.com" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

/** With `children`, the separator changes state and renders a label in the middle of the rule. */
export const Separator: StoryObj<typeof separatorMeta> = {
  args: { children: 'or continue with' },
  argTypes: {
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: ({ children, ...args }) => (
    <FieldSet className="w-80">
      <FieldSeparator {...args}>{children || undefined}</FieldSeparator>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="field-separator">Email</FieldLabel>
          <Input id="field-separator" placeholder="you@example.com" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

/**
 * `errors` accepts the shape a schema resolver already produces. One message
 * renders as a line, duplicates collapse, and several become a list.
 */
export const Error: StoryObj<typeof errorMeta> = {
  args: {
    errors: [{ message: 'This key expired in March.' }],
  },
  argTypes: {
    errors: {
      control: 'object',
      description: 'Resolver output. Duplicates are removed; more than one message renders a list.',
      table: { category: 'Validation' },
    },
    children: { control: 'text', table: { category: 'Content' } },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <Field data-invalid="true" className="w-80">
      <FieldLabel htmlFor="field-error">API key</FieldLabel>
      <Input id="field-error" aria-invalid defaultValue="sk-broken" />
      <FieldError {...args} />
    </Field>
  ),
};

/** `data-disabled` on the field dims the label without touching the control's own contrast. */
export const Disabled: Story = {
  parameters: { controls: { include: ['orientation'] } },
  render: (args) => (
    <FieldSet className="w-80">
      <FieldGroup>
        <Field {...args} data-disabled="true">
          <FieldLabel htmlFor="field-disabled">Email</FieldLabel>
          <Input id="field-disabled" placeholder="you@example.com" disabled />
          <FieldDescription>The address is managed by your identity provider.</FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};
