import { render } from '@testing-library/react';
import { Bar, BarChart } from 'recharts';
import { describe, expect, it } from 'vitest';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from './chart';

const config = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
};

describe('Chart', () => {
  it('maps each series to a CSS variable on the container', () => {
    const { container } = render(
      <ChartContainer config={config} className="h-64 w-96">
        <BarChart data={[{ month: 'Jan', desktop: 186 }]}>
          <Bar dataKey="desktop" fill="var(--color-desktop)" />
        </BarChart>
      </ChartContainer>,
    );

    const styles = [...container.querySelectorAll('style')]
      .map((element) => element.textContent)
      .join('\n');

    expect(styles).toContain('--color-desktop: var(--chart-1)');
  });

  it('keeps the caller className on the container', () => {
    const { container } = render(
      <ChartContainer config={config} className="h-64 w-96">
        <BarChart data={[]}>
          <Bar dataKey="desktop" />
        </BarChart>
      </ChartContainer>,
    );

    expect(container.querySelector('[data-slot="chart"]')?.className).toContain('h-64');
  });

  it('exports the tooltip and legend parts the stories compose', () => {
    expect(ChartTooltip).toBeDefined();
    expect(ChartTooltipContent).toBeDefined();
    expect(ChartLegend).toBeDefined();
    expect(ChartLegendContent).toBeDefined();
  });
});
