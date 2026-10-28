import { ToggleGroup, ToggleGroupItem } from './toggle-group';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  subcomponents: { ToggleGroupItem },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Several toggles that behave as one control — an alignment picker, a view switcher. `type` is fixed per group, so it is shown in the code rather than exposed as a control.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      table: { category: 'Appearance' },
    },
    spacing: {
      control: { type: 'number', min: 0, max: 8 },
      description: 'Gap between items in spacing units. 0 joins them into one block.',
      table: { category: 'Layout' },
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      table: { category: 'Layout' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
  },
  args: {
    variant: 'default',
    size: 'default',
    spacing: 0,
    orientation: 'horizontal',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: (args) => (
    <ToggleGroup {...args} type="single" defaultValue="center" aria-label="Text alignment">
      <ToggleGroupItem value="left" aria-label="Align left">
        L
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align centre">
        C
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        R
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  render: (args) => (
    <ToggleGroup
      {...args}
      type="multiple"
      defaultValue={['bold', 'italic']}
      aria-label="Formatting"
    >
      <ToggleGroupItem value="bold" aria-label="Bold">
        B
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        I
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Outline: Story = {
  args: { variant: 'outline' },
  render: Single.render,
};
