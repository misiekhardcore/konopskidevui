import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Trace, TraceLine, TraceIcon, TraceTitle } from './trace';

describe('Trace', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <Trace>
        <TraceLine status="running">
          <TraceIcon>◌</TraceIcon>
          <TraceTitle>Working</TraceTitle>
        </TraceLine>
      </Trace>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <Trace>
        <TraceLine status="running">
          <TraceIcon>◌</TraceIcon>
          <TraceTitle>Working</TraceTitle>
        </TraceLine>
      </Trace>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders every documented variant', () => {
    for (const value of ['running', 'error', 'pending'] as const) {
      const { unmount } = render(
        <Trace>
          <TraceLine status={value}>
            <TraceTitle>Step</TraceTitle>
          </TraceLine>
        </Trace>,
      );
      expect(document.body.textContent).toBeTruthy();
      unmount();
    }
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
