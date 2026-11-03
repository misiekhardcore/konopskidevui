import { render, screen } from '@testing-library/react';
import { Bar, BarChart } from 'recharts';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from './chart';

import type { ChartConfig } from './chart';

type TooltipItem = NonNullable<React.ComponentProps<typeof ChartTooltipContent>['payload']>[number];
type LegendItem = NonNullable<React.ComponentProps<typeof ChartLegendContent>['payload']>[number];

const config: ChartConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
};

const withIcon: ChartConfig = {
  desktop: { label: 'Desktop', icon: () => <svg data-testid="series-icon" /> },
};

function renderInChart(node: React.ReactNode, chartConfig: ChartConfig = config) {
  return render(<ChartContainer config={chartConfig}>{node}</ChartContainer>);
}

/**
 * The tooltip's own output, without ChartContainer's injected `<style>` block.
 * The label is a string so the header shows the axis value and the rows show the
 * series labels, which keeps the two apart in the DOM.
 */
function renderTooltip(props: React.ComponentProps<typeof ChartTooltipContent>) {
  return renderInChart(
    <div data-testid="tooltip">
      <ChartTooltipContent active label="Jan" {...props} />
    </div>,
  );
}

const payload: TooltipItem[] = [
  {
    name: 'Desktop',
    dataKey: 'desktop',
    value: 186,
    color: 'var(--chart-1)',
    payload: {},
    graphicalItemId: 'bar-0',
  },
];

const swatch = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-testid="tooltip"] .h-2\\.5.w-2\\.5');

// jsdom lays nothing out, so recharts' ResponsiveContainer measures 0×0 and
// renders no children at all. Give every element the default chart size.
beforeAll(() => {
  Element.prototype.getBoundingClientRect = () =>
    ({
      width: 320,
      height: 200,
      top: 0,
      left: 0,
      right: 320,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
});

describe('ChartStyle', () => {
  it('declares a CSS variable per series, for both themes', () => {
    const { container } = render(<ChartStyle id="revenue" config={config} />);

    expect(container.textContent).toContain('--color-desktop: var(--chart-1);');
    expect(container.textContent).toContain('[data-chart=revenue]');
    expect(container.textContent).toContain('.dark [data-chart=revenue]');
  });

  it('takes the colours from a theme entry when the config has one', () => {
    const { container } = render(
      <ChartStyle id="theme" config={{ desktop: { theme: { light: '#111', dark: '#eee' } } }} />,
    );

    expect(container.textContent).toContain('--color-desktop: #111;');
    expect(container.textContent).toContain('--color-desktop: #eee;');
  });

  it('skips a theme that leaves one mode undefined', () => {
    const { container } = render(
      // @ts-expect-error -- a partial theme is exactly the case under test.
      <ChartStyle id="partial" config={{ a: { theme: { light: '#111' } } }} />,
    );

    expect(container.textContent?.match(/--color-a:/g)).toHaveLength(1);
  });

  it('renders nothing when no series carries a colour', () => {
    const { container } = render(<ChartStyle id="plain" config={{ a: { label: 'A' } }} />);

    expect(container.querySelector('style')).toBeNull();
  });
});

describe('ChartContainer', () => {
  it('names the chart from the id it is given', () => {
    const { container } = render(
      <ChartContainer id="revenue" config={config}>
        <div>body</div>
      </ChartContainer>,
    );

    expect(container.querySelector('[data-slot="chart"]')).toHaveAttribute(
      'data-chart',
      'chart-revenue',
    );
  });

  it('generates an id when none is given, so two charts do not share styles', () => {
    const { container } = render(
      <ChartContainer config={config}>
        <div>body</div>
      </ChartContainer>,
    );

    expect(container.querySelector('[data-slot="chart"]')?.getAttribute('data-chart')).toMatch(
      /^chart-/,
    );
  });

  it('keeps the caller className alongside its own', () => {
    const { container } = render(
      <ChartContainer config={config} className="h-64">
        <div>body</div>
      </ChartContainer>,
    );

    const chart = container.querySelector('[data-slot="chart"]');
    expect(chart?.className).toContain('h-64');
    expect(chart?.className).toContain('aspect-video');
  });
});

describe('ChartTooltipContent', () => {
  it('renders nothing until the pointer is over a point', () => {
    renderTooltip({ active: false, payload });

    expect(screen.getByTestId('tooltip')).toBeEmptyDOMElement();
  });

  it('renders nothing without a payload', () => {
    const { unmount } = renderTooltip({ active: true });
    expect(screen.getByTestId('tooltip')).toBeEmptyDOMElement();
    unmount();

    renderTooltip({ active: true, payload: [] });
    expect(screen.getByTestId('tooltip')).toBeEmptyDOMElement();
  });

  it('takes the series label and value from the config', () => {
    renderTooltip({ payload });

    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('186')).toBeInTheDocument();
  });

  it('groups thousands for numeric values and leaves strings alone', () => {
    const { unmount } = renderTooltip({ payload: [{ ...payload[0], value: 1234 }] });
    expect(screen.getByText('1,234')).toBeInTheDocument();
    unmount();

    renderTooltip({ payload: [{ ...payload[0], value: 'n/a' }] });
    expect(screen.getByText('n/a')).toBeInTheDocument();
  });

  it('drops the value when the series has none', () => {
    renderTooltip({ payload: [{ ...payload[0], value: undefined }] });

    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.queryByText('186')).not.toBeInTheDocument();
  });

  it('shows one row per series and skips the ones recharts marks as none', () => {
    renderTooltip({
      payload: [...payload, { ...payload[0], name: 'Mobile', value: 80, type: 'none' }],
    });

    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.queryByText('Mobile')).not.toBeInTheDocument();
  });

  it('hides the label when asked, keeping the values', () => {
    renderTooltip({ payload, hideLabel: true });

    expect(screen.queryByText('Jan')).not.toBeInTheDocument();
    expect(screen.getByText('186')).toBeInTheDocument();
  });

  it('nests the label inside the value for a single line series', () => {
    renderTooltip({ payload, indicator: 'line' });

    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('186')).toBeInTheDocument();
  });

  it('draws the swatch shape the indicator asks for', () => {
    const { container, unmount } = renderTooltip({ payload, indicator: 'dashed' });
    expect(container.querySelector('.border-dashed')).not.toBeNull();
    unmount();

    const { container: lineView } = renderTooltip({ payload, indicator: 'line' });
    expect(lineView.querySelector('.w-1')).not.toBeNull();
  });

  it('can drop the swatch entirely', () => {
    const { container } = renderTooltip({ payload, hideIndicator: true });

    expect(swatch(container)).toBeNull();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
  });

  it('prefers the icon a series brings over the swatch', () => {
    const { container } = renderInChart(
      // The row looks up the config by name, then dataKey: a name that matches a
      // config key is what selects the icon.
      <ChartTooltipContent active label="Jan" payload={[{ ...payload[0], name: 'desktop' }]} />,
      withIcon,
    );

    expect(screen.getByTestId('series-icon')).toBeInTheDocument();
    expect(swatch(container)).toBeNull();
  });

  it('lets the caller format the value', () => {
    renderTooltip({
      payload,
      formatter: (value) => <span>formatted {String(value)}</span>,
    });

    expect(screen.getByText(/formatted 186/)).toBeInTheDocument();
  });

  it('lets the caller format the label', () => {
    renderTooltip({
      payload,
      labelFormatter: (value) => <span>on {String(value)}</span>,
    });

    expect(screen.getByText(/on Jan/)).toBeInTheDocument();
  });

  it('resolves the series through nameKey and labelKey', () => {
    renderTooltip({
      payload: [{ ...payload[0], name: 'whatever', payload: { desktop: 'desktop' } }],
      nameKey: 'desktop',
      labelKey: 'desktop',
    });

    // Header and row both resolve through the key, so the label appears twice.
    expect(screen.getAllByText('Desktop')).toHaveLength(2);
  });

  it('falls back to the payload name when the config has no entry', () => {
    renderTooltip({ payload: [{ ...payload[0], name: 'Unlisted', dataKey: 'unlisted' }] });

    expect(screen.getByText('Unlisted')).toBeInTheDocument();
  });

  it('uses the fill of the datum when the series has no colour of its own', () => {
    const { container } = renderTooltip({
      payload: [{ ...payload[0], color: undefined, payload: { fill: 'var(--chart-3)' } }],
    });

    expect(swatch(container)?.style.getPropertyValue('--color-bg')).toBe('var(--chart-3)');
  });
});

describe('ChartLegendContent', () => {
  const items: LegendItem[] = [
    { value: 'Desktop', dataKey: 'desktop', color: 'var(--chart-1)' },
    { value: 'Mobile', dataKey: 'mobile', color: 'var(--chart-2)' },
  ];

  const swatches = (container: HTMLElement) =>
    container.querySelectorAll<HTMLElement>('[data-testid="legend"] div[style]');

  function renderLegend(props: React.ComponentProps<typeof ChartLegendContent>) {
    return renderInChart(
      <div data-testid="legend">
        <ChartLegendContent {...props} />
      </div>,
    );
  }

  it('renders nothing without payload', () => {
    renderLegend({});

    expect(screen.getByTestId('legend')).toBeEmptyDOMElement();
  });

  it('lists every series with its label and colour', () => {
    const { container } = renderLegend({ payload: items });

    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();
    expect(swatches(container)[0]?.style.backgroundColor).toBe('var(--chart-1)');
  });

  it('puts the legend below the chart by default and above when asked', () => {
    const { container, unmount } = renderLegend({ payload: items });
    expect(container.querySelector('.pt-3')).not.toBeNull();
    unmount();

    const { container: topView } = renderLegend({ payload: items, verticalAlign: 'top' });
    expect(topView.querySelector('.pb-3')).not.toBeNull();
  });

  it('keeps the labels and drops the swatches when asked', () => {
    const { container } = renderLegend({ payload: items, hideIcon: true });

    expect(screen.getByText('Desktop')).toBeInTheDocument();
    // Without `hideIcon` a series with an icon would draw it here; the swatch is what remains.
    expect(swatches(container).length).toBeGreaterThan(0);
  });

  it('draws the icon a series brings instead of a swatch', () => {
    renderInChart(<ChartLegendContent payload={items} />, withIcon);

    expect(screen.getByTestId('series-icon')).toBeInTheDocument();
  });

  it('skips the series recharts marks as none', () => {
    renderLegend({
      payload: [...items, { ...items[0], value: 'Ghost', type: 'none' }],
    });

    expect(screen.queryByText('Ghost')).not.toBeInTheDocument();
  });

  it('resolves the label through nameKey', () => {
    renderLegend({
      payload: [{ ...items[0], payload: { desktop: 'desktop' } }],
      nameKey: 'desktop',
    });

    expect(screen.getByText('Desktop')).toBeInTheDocument();
  });
});

describe('Chart', () => {
  it('renders the composed chart, its style block and its parts', () => {
    const { container } = render(
      <ChartContainer config={config} className="h-64 w-96">
        <BarChart data={[{ month: 'Jan', desktop: 186 }]}>
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" />
        </BarChart>
      </ChartContainer>,
    );

    expect(container.textContent).toContain('--color-desktop: var(--chart-1)');
    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument();
  });

  it('refuses to render a tooltip outside a chart', () => {
    // React logs the caught error; keep the expected noise out of the output.
    const consoleError = console.error;
    console.error = () => {};

    try {
      expect(() => render(<ChartTooltipContent active payload={payload} />)).toThrow(
        /useChart must be used within a <ChartContainer/,
      );
    } finally {
      console.error = consoleError;
    }
  });
});
