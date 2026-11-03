import { Label } from './label';
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from './native-select';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
  tags: ['autodocs'],
  subcomponents: { NativeSelectOptGroup, NativeSelectOption },
  parameters: {
    docs: {
      description: {
        component:
          'A native `<select>` for long option lists on mobile or when a styled menu is not worth the weight. Falls back to platform UI by design.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'default'],
      description: 'Control height: `sm` is 28px, `default` 32px, matching the other controls.',
      table: { category: 'Appearance', defaultValue: { summary: 'default' } },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: {
    size: 'default',
    disabled: false,
  },
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  render: (args) => (
    <div className="flex w-64 flex-col gap-2">
      <Label htmlFor="sort">Sort by</Label>
      <NativeSelect {...args} id="sort" defaultValue="newest">
        <NativeSelectOption value="newest">Newest first</NativeSelectOption>
        <NativeSelectOption value="oldest">Oldest first</NativeSelectOption>
        <NativeSelectOptGroup label="Alphabetical">
          <NativeSelectOption value="az">A → Z</NativeSelectOption>
          <NativeSelectOption value="za">Z → A</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  ),
};

/** The two heights, side by side, against an `Input` of the same height. */
export const Sizes: Story = {
  parameters: { controls: { include: ['disabled'] } },
  render: (args) => (
    <div className="flex w-64 flex-col gap-4">
      {(['default', 'sm'] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <Label htmlFor={`size-${size}`}>{size}</Label>
          <NativeSelect {...args} id={`size-${size}`} size={size} defaultValue="newest">
            <NativeSelectOption value="newest">Newest first</NativeSelectOption>
            <NativeSelectOption value="oldest">Oldest first</NativeSelectOption>
          </NativeSelect>
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};

/** `aria-invalid` is the only invalid signal — the native control paints its own border. */
export const Invalid: Story = {
  args: { 'aria-invalid': true },
  render: Default.render,
};
