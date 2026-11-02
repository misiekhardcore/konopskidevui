import { useState } from 'react';
import { CalendarDay, type DateRange } from 'react-day-picker';

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
      description: 'Selection model. Each mode changes the type of `selected` in the caller.',
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
    buttonVariant: {
      control: 'select',
      description: 'Variant the previous/next arrows borrow from `Button`.',
      table: { category: 'Appearance' },
    },
    locale: {
      control: false,
      description: 'date-fns locale.',
      table: { category: 'Accessibility' },
    },
    formatters: {
      control: false,
      description: 'Overrides for the weekday and month names.',
      table: { category: 'Accessibility' },
    },
    components: {
      control: false,
      description: 'Slot overrides. `CalendarDayButton` is the one the house style touches.',
      table: { category: 'Composition' },
    },
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

/** A fixed month keeps the visual regression stable across runs. */
const september = new Date(2026, 8, 1);

export const Default: Story = {
  render: (args) => <Calendar {...args} defaultMonth={september} className="rounded-sm border" />,
};

/**
 * `range` selects a start and an end; the stylesheet fills the days between
 * them. react-day-picker keeps selection controlled, so the story owns it.
 */
export const Range: Story = {
  parameters: { controls: { include: ['showOutsideDays', 'captionLayout'] } },
  render: ({ showOutsideDays, captionLayout }) => {
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(2026, 8, 9),
      to: new Date(2026, 8, 14),
    });

    return (
      <Calendar
        mode="range"
        required={false}
        selected={range}
        onSelect={setRange}
        showOutsideDays={showOutsideDays}
        captionLayout={captionLayout}
        defaultMonth={september}
        numberOfMonths={2}
        className="rounded-sm border"
      />
    );
  },
};

/** `multiple` keeps a set of unrelated days, toggled on each click. */
export const Multiple: Story = {
  parameters: { controls: { include: ['showOutsideDays', 'captionLayout'] } },
  render: ({ showOutsideDays, captionLayout }) => {
    const [days, setDays] = useState<Date[] | undefined>([
      new Date(2026, 8, 3),
      new Date(2026, 8, 17),
    ]);

    return (
      <Calendar
        mode="multiple"
        required={false}
        selected={days ?? []}
        onSelect={(next) => setDays(next ?? [])}
        showOutsideDays={showOutsideDays}
        captionLayout={captionLayout}
        defaultMonth={september}
        className="rounded-sm border"
      />
    );
  },
};

/** Dropdown captions trade two arrows for a month and year select. */
export const DropdownCaption: Story = {
  parameters: { controls: { include: ['showOutsideDays', 'disabled'] } },
  render: (args) => (
    <Calendar
      {...args}
      defaultMonth={september}
      captionLayout="dropdown"
      className="rounded-sm border"
    />
  ),
};

/** Outside days are part of the grid flow, so hiding them changes the month's shape. */
export const WithoutOutsideDays: Story = {
  args: { showOutsideDays: false },
  render: Default.render,
};

/** A matcher disables the weekends and any day before the 8th. */
export const DisabledDays: Story = {
  parameters: { controls: { include: ['mode', 'captionLayout'] } },
  render: (args) => (
    <Calendar
      {...args}
      defaultMonth={september}
      disabled={[{ dayOfWeek: [0, 6] }, { before: new Date(2026, 8, 8) }]}
      className="rounded-sm border"
    />
  ),
};

const dayButtonMeta = { component: CalendarDayButton } as const satisfies Partial<
  Meta<typeof CalendarDayButton>
>;

/**
 * The cell the grid renders. `locale` only decides how the date is spelled in
 * `data-day`; the calendar passes `day` and `modifiers` to it.
 */
export const DayButton: StoryObj<typeof dayButtonMeta> = {
  args: {
    day: new CalendarDay(new Date(2026, 10, 3), new Date(2026, 10, 1)),
    modifiers: { selected: true },
    locale: { code: 'de-DE' },
  },
  argTypes: {
    locale: {
      control: 'object',
      description: 'Locale for the date in `data-day`: `{ code: "de-DE" }` renders 3.11.2026.',
      table: { category: 'Accessibility' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  render: (args) => (
    <div className="w-10">
      <CalendarDayButton {...args}>{args.day.date.getDate()}</CalendarDayButton>
    </div>
  ),
};
