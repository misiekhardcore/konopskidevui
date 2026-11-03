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
      control: 'inline-radio',
      options: ['default', 'outline'],
      description: 'Surface treatment of the joined items.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
      description: 'Height of every item in the group.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
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
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'], table: { category: 'Accessibility' } },
    value: {
      control: 'text',
      description: 'Controlled pressed value: a string for `single`, an array for `multiple`.',
      table: { category: 'State' },
    },
    onValueChange: { action: 'value changed', table: { category: 'Events' } },
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
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
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

/** `spacing` is the gap: 0 joins the items into one segmented control. */
export const Spacing: Story = {
  parameters: { controls: { include: ['spacing', 'variant', 'size'] } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      {[0, 2].map((spacing) => (
        <ToggleGroup
          {...args}
          key={spacing}
          spacing={spacing}
          type="single"
          defaultValue="center"
          aria-label={`Text alignment, spacing ${spacing}`}
        >
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
      ))}
    </div>
  ),
};

/** The orientation changes the stacking and the arrow-key axis, not the type. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: Single.render,
};

const itemMeta = { component: ToggleGroupItem } as const satisfies Partial<
  Meta<typeof ToggleGroupItem>
>;

/** An item inherits the group's variant and size unless it sets its own. */
export const Item: StoryObj<typeof itemMeta> = {
  args: { variant: 'default', size: 'default', value: 'left' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'outline'],
      description: 'Overrides the group for this item.',
      table: { category: 'Appearance' },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
      description: 'Overrides the group for this item.',
      table: { category: 'Appearance' },
    },
  },
  render: ({ variant, size, value }) => (
    <ToggleGroup type="single" defaultValue="center" spacing={0} aria-label="Text alignment">
      <ToggleGroupItem value={value} aria-label="Align left" variant={variant} size={size}>
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
