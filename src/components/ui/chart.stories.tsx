import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from './chart';

import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * `config` and `children` are required props with no meaningful control (one is
 * an object, the other is a chart), so this meta is intentionally untyped
 * against the component.
 */
const meta: Meta = {
  title: 'Components/Chart',
  component: ChartContainer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Recharts in the konopskidev palette. The `config` maps each series key to a label and a token (`var(--chart-1)`…), so charts, code blocks and diffs share one categorical language. The container owns the height.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Sizing belongs here — a chart without a height renders nothing.',
      table: { category: 'Layout' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 73, mobile: 190 },
];

const config = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
};

export const BarChartExample: Story = {
  // The one composition Chromatic snapshots for this component.
  parameters: { chromatic: { disableSnapshot: false } },
  args: { className: 'h-64 w-[28rem]' },
  render: (args) => (
    <ChartContainer {...args} config={config}>
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={2} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={2} />
      </BarChart>
    </ChartContainer>
  ),
};

export const LineChartExample: Story = {
  args: { className: 'h-64 w-[28rem]' },
  render: (args) => (
    <ChartContainer {...args} config={config}>
      <LineChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Line dataKey="desktop" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
        <Line dataKey="mobile" stroke="var(--color-mobile)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  ),
};

/**
 * The tooltip and legend are parts with props of their own, so they get their
 * own stories: `config` and `children` belong to the container, everything else
 * is the part's own business.
 */
const tooltipMeta = {
  component: ChartTooltipContent,
} as const satisfies Partial<Meta<typeof ChartTooltipContent>>;

const legendMeta = {
  component: ChartLegendContent,
} as const satisfies Partial<Meta<typeof ChartLegendContent>>;

export const Tooltip: StoryObj<typeof tooltipMeta> = {
  args: { indicator: 'dot', hideLabel: false, hideIndicator: false },
  argTypes: {
    indicator: {
      control: 'inline-radio',
      options: ['dot', 'line', 'dashed'],
      description: 'How the series colour is drawn next to each value.',
      table: { category: 'Appearance', defaultValue: { summary: 'dot' } },
    },
    hideLabel: {
      control: 'boolean',
      description: 'Drop the series label, keeping only the value.',
      table: { category: 'Content', defaultValue: { summary: 'false' } },
    },
    hideIndicator: {
      control: 'boolean',
      description: 'Drop the colour swatch.',
      table: { category: 'Content', defaultValue: { summary: 'false' } },
    },
    nameKey: { control: 'text', table: { category: 'Data' } },
    labelKey: { control: 'text', table: { category: 'Data' } },
  },
  render: (args) => (
    <ChartContainer config={config} className="h-64 w-[28rem]">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent {...args} />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={2} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={2} />
      </BarChart>
    </ChartContainer>
  ),
};

export const Legend: StoryObj<typeof legendMeta> = {
  args: { hideIcon: false, verticalAlign: 'bottom' },
  argTypes: {
    hideIcon: {
      control: 'boolean',
      description: 'Hide the swatch and keep the labels.',
      table: { category: 'Content', defaultValue: { summary: 'false' } },
    },
    verticalAlign: {
      control: 'inline-radio',
      options: ['top', 'bottom'],
      description: 'Where the legend sits inside the chart box.',
      table: { category: 'Layout', defaultValue: { summary: 'bottom' } },
    },
    nameKey: { control: 'text', table: { category: 'Data' } },
  },
  render: (args) => (
    <ChartContainer config={config} className="h-64 w-[28rem]">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent {...args} />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={2} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={2} />
      </BarChart>
    </ChartContainer>
  ),
};

export const AreaChartExample: Story = {
  args: { className: 'h-64 w-[28rem]' },
  render: (args) => (
    <ChartContainer {...args} config={config}>
      <AreaChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="desktop"
          fill="var(--color-desktop)"
          stroke="var(--color-desktop)"
          fillOpacity={0.3}
        />
      </AreaChart>
    </ChartContainer>
  ),
};
