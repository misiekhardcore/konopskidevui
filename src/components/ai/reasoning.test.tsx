import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { reasoningParts } from '../../testing/ai-parts';
import { Reasoning } from './reasoning';

import type { ReasoningPart } from './reasoning';

/** The reasoning body as the browser hands it back, whitespace and all. */
function content() {
  return document.querySelector('[data-slot="trace-collapsible-content-inner"]')?.textContent;
}

/** The line's status is what switches the title's shimmer on. */
function lineStatus() {
  return document.querySelector('[data-slot="trace-line"]')?.getAttribute('data-status');
}

describe('Reasoning', () => {
  it('opens while the model is still thinking, under a title that says so', () => {
    render(<Reasoning part={reasoningParts.streaming} />);

    const trigger = screen.getByRole('button', { name: /Thinking/ });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(content()).toBe(reasoningParts.streaming.text);
  });

  it('marks the title as running while the reasoning streams', () => {
    render(<Reasoning part={reasoningParts.streaming} />);

    expect(lineStatus()).toBe('running');
  });

  it('collapses when the reasoning ends, keeping the text one activation away', async () => {
    const { rerender } = render(<Reasoning part={reasoningParts.streaming} />);

    rerender(<Reasoning part={reasoningParts.done} />);

    const trigger = screen.getByRole('button', { name: /Thought/ });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(content()).toBeUndefined();
    expect(lineStatus()).toBeNull();

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Multi-paragraph reasoning keeps its blank line: the body is plain text.
    expect(content()).toBe(reasoningParts.done.text);
  });

  it('arrives collapsed when a stored conversation is rendered', () => {
    render(<Reasoning part={reasoningParts.done} />);

    expect(screen.getByRole('button', { name: /Thought/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('reports a known duration as elapsed time once the reasoning ends', () => {
    render(<Reasoning part={reasoningParts.done} durationMs={4200} />);

    expect(screen.getByRole('button', { name: 'Thought for 4.2s' })).toBeInTheDocument();
  });

  it('omits the figure when the duration is unknown', () => {
    render(<Reasoning part={reasoningParts.done} />);

    expect(screen.getByRole('button', { name: 'Thought' })).toBeInTheDocument();
    expect(screen.queryByText(/4\.2s/)).toBeNull();
  });

  it('ignores a duration that is still streaming, since elapsed time is not final', () => {
    render(<Reasoning part={reasoningParts.streaming} durationMs={4200} />);

    expect(screen.queryByText(/4\.2s/)).toBeNull();
  });

  it('formats minutes for reasoning that took longer than one', () => {
    render(<Reasoning part={reasoningParts.done} durationMs={83_400} />);

    expect(screen.getByRole('button', { name: 'Thought for 1m 23s' })).toBeInTheDocument();
  });

  it('treats an unusable duration as unknown rather than inventing one', () => {
    render(<Reasoning part={reasoningParts.done} durationMs={Number.NaN} />);

    expect(screen.getByRole('button', { name: 'Thought' })).toBeInTheDocument();
  });

  it('is operable with the keyboard and exposes its state', async () => {
    render(<Reasoning part={reasoningParts.done} />);

    const trigger = screen.getByRole('button', { name: 'Thought' });

    trigger.focus();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.keyboard('{Enter}');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls');
  });

  it('translates every string it shows', () => {
    render(
      <Reasoning
        part={reasoningParts.done}
        durationMs={4200}
        labels={{ thought: 'Myślał', elapsed: 'przez {duration}' }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Myślał przez 4.2s' })).toBeInTheDocument();
  });

  it('leaves the expanded state to the app when it is controlled', async () => {
    const onOpenChange = vi.fn();

    render(<Reasoning part={reasoningParts.done} open onOpenChange={onOpenChange} />);

    const trigger = screen.getByRole('button', { name: 'Thought' });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders nothing for an empty, finished part', () => {
    const part = {
      ...reasoningParts.done,
      text: '',
    } as ReasoningPart;

    const { container } = render(<Reasoning part={part} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('keeps an empty streaming part visible as activity', () => {
    const part = {
      ...reasoningParts.streaming,
      text: '',
    } as ReasoningPart;

    render(<Reasoning part={part} />);

    expect(screen.getByRole('button', { name: /Thinking/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(content()).toBeUndefined();
  });

  it('renders under server rendering without a browser', () => {
    const view = renderToString(<Reasoning part={reasoningParts.streaming} />);

    expect(view).toContain('Thinking');
  });
});
