import { Calendar, CalendarDayButton } from './calendar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  subcomponents: { CalendarDayButton },
  parameters: {
    docs: {
      description: {
        component:
          'A date picker grid built on react-day-picker. Dates are local `Date` objects; format them for display only at the edges.',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            // react-day-picker names each day "Sunday, September 27, 2026" over
            // the visible "27". That is the announced name screen readers want,
            // but axe reads it as a label-in-name mismatch.
            id: 'label-content-name-mismatch',
            enabled: false,
          },
        ],
      },
    },
  },
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: ['single', 'multiple', 'range'],
      description: 'Selection model.',
      table: { category: 'Behaviour' },
    },
    showOutsideDays: {
      control: 'boolean',
      description: 'Render the days of the neighbouring months.',
      table: { category: 'Appearance' },
    },
    captionLayout: {
      control: 'select',
      options: ['label', 'dropdown', 'dropdown-months', 'dropdown-years'],
      description: 'Month/year navigation style.',
      table: { category: 'Appearance' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
  },
  args: {
    mode: 'single',
    showOutsideDays: true,
    captionLayout: 'label',
    disabled: false,
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <Calendar {...args} className="rounded-sm border" />
    </>
  ),
};
