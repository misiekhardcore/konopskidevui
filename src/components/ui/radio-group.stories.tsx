import { Label } from './label';
import { RadioGroup, RadioGroupItem } from './radio-group';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  subcomponents: { RadioGroupItem },
  parameters: {
    docs: {
      description: {
        component:
          'One choice out of a short, always-visible list. If the options need explaining, use radios; if there are more than about seven, use a Select.',
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description:
        'Controlled selected value. Leave it unset and use `defaultValue` for uncontrolled use.',
      table: { category: 'State' },
    },
    defaultValue: {
      control: 'text',
      description: 'The selected value.',
      table: { category: 'State' },
    },
    onValueChange: { action: 'value changed', table: { category: 'Events' } },
    name: { control: 'text', description: 'Form field name.', table: { category: 'Form' } },
    required: { control: 'boolean', table: { category: 'Validation' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Arrow-key axis for the group.',
      table: { category: 'Layout' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    defaultValue: 'monthly',
    disabled: false,
    orientation: 'vertical',
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <RadioGroup {...args} className="flex flex-col gap-3" defaultValue="monthly">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="monthly" id="monthly" />
          <Label htmlFor="monthly">Monthly · €9</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="yearly" id="yearly" />
          <Label htmlFor="yearly">Yearly · €90</Label>
        </div>
      </RadioGroup>
    </>
  ),
};
