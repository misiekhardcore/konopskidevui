import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Trace, TraceLine, TraceTitle } from './trace';

describe('Trace', () => {
  it('marks the status of every line', () => {
    const { container } = render(
      <Trace>
        {(['running', 'error', 'pending'] as const).map((status) => (
          <TraceLine key={status} status={status}>
            <TraceTitle>{status}</TraceTitle>
          </TraceLine>
        ))}
      </Trace>,
    );

    expect(
      [...container.querySelectorAll('[data-slot="trace-line"]')].map((line) =>
        line.getAttribute('data-status'),
      ),
    ).toEqual(['running', 'error', 'pending']);
  });

  it('exposes the status of each line', async () => {
    render(
      <Trace>
        <TraceLine status="error">
          <TraceTitle>Failed</TraceTitle>
        </TraceLine>
      </Trace>,
    );

    expect(document.querySelector('[data-slot="trace-line"]')).toHaveAttribute(
      'data-status',
      'error',
    );
  });
});
