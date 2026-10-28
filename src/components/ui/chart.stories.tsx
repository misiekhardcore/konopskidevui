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
