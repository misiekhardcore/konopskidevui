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
      control: 'select',
      description: 'Control height.',
      table: { category: 'Appearance' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
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
  render: (args) => (
    <>
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
    </>
  ),
};
