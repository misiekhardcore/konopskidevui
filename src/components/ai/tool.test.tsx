import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { approvedToolPart, dynamicToolParts, toolParts } from '../../testing/ai-parts';
import { Tool } from './tool';

import type { ToolPart } from './tool';

const REASON_LABEL = 'Reason for declining (optional)';

describe('Tool', () => {
  it('renders one collapsed row naming the tool and that it is running', () => {
    render(<Tool part={toolParts['input-streaming']} />);

    const trigger = screen.getByRole('button', { name: /getWeather/ });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('getWeather')).toBeInTheDocument();
    expect(screen.getByText(/is running/)).toBeInTheDocument();
  });

  it('keeps the body out of the accessibility tree until the row opens', async () => {
    render(<Tool part={toolParts['input-streaming']} />);

    expect(screen.queryByText(/Partial input/)).toBeNull();
    expect(screen.queryByText('{"location":"Kra')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /getWeather/ }));

    expect(screen.getByText(/Partial input/)).toBeInTheDocument();
    expect(screen.getByText('{"location":"Kra')).toBeInTheDocument();
  });

  it('shows partial input as plain text rather than a parse failure', async () => {
    const { container } = render(<Tool part={toolParts['input-streaming']} />);

    await userEvent.click(screen.getByRole('button', { name: /getWeather/ }));

    expect(container.querySelector('[data-slot="code-block"]')).toHaveTextContent(
      '{"location":"Kra',
    );
  });

  it('is operable with the keyboard', async () => {
    render(<Tool part={toolParts['input-available']} />);

    const trigger = screen.getByRole('button', { name: /getWeather/ });

    trigger.focus();
    expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the input once an available call is opened', async () => {
    render(<Tool part={toolParts['input-available']} />);

    expect(screen.getByText('getWeather')).toBeInTheDocument();
    expect(screen.queryByText(/"Kraków"/)).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /getWeather/ }));

    expect(screen.getByText(/Input/)).toBeInTheDocument();
    expect(screen.getByText(/"Kraków"/)).toBeInTheDocument();
  });

  it('opens itself for a pending approval and refuses to collapse', async () => {
    render(<Tool part={toolParts['approval-requested']} />);

    const trigger = screen.getByRole('button', { name: /getWeather/ });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(within(trigger).getByText(/waiting for your approval/)).toBeInTheDocument();

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
  });

  it('delegates an approval decision with the approval id', async () => {
    const onApprove = vi.fn();

    render(<Tool part={toolParts['approval-requested']} onApprove={onApprove} />);

    await userEvent.click(screen.getByRole('button', { name: 'Approve' }));

    expect(onApprove).toHaveBeenCalledWith({ id: 'approval_getWeather' });
  });

  it('delegates a denial with the typed reason', async () => {
    const onDeny = vi.fn();

    render(<Tool part={toolParts['approval-requested']} onDeny={onDeny} />);

    await userEvent.type(screen.getByLabelText(REASON_LABEL), 'Not my location.');
    await userEvent.click(screen.getByRole('button', { name: 'Decline' }));

    expect(onDeny).toHaveBeenCalledWith({
      id: 'approval_getWeather',
      reason: 'Not my location.',
    });
  });

  it('collapses a recorded approval and summarises the decision', () => {
    render(<Tool part={toolParts['approval-responded']} />);

    const trigger = screen.getByRole('button', { name: /getWeather/ });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText(/was approved/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
  });

  it('summarises a denial as declined', () => {
    render(<Tool part={toolParts['output-denied']} />);

    expect(screen.getByText(/was declined/)).toBeInTheDocument();
  });

  it('renders a structured output as JSON in the code block chrome', async () => {
    render(<Tool part={toolParts['output-available']} />);

    await userEvent.click(screen.getByRole('button', { name: /getWeather/ }));

    expect(screen.getByText(/Output/)).toBeInTheDocument();
    expect(screen.getByText(/"temperatureC": 21/)).toBeInTheDocument();
  });

  it('keeps the approval when a completed call still carries one', async () => {
    render(<Tool part={approvedToolPart} />);

    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /getWeather/ }));

    expect(screen.getByText(/was approved/)).toBeInTheDocument();
    expect(screen.getByText('Approved by the on-call engineer.')).toBeInTheDocument();
    expect(screen.getByText(/"temperatureC": 21/)).toBeInTheDocument();
  });

  it('keeps the tool name when the call failed and shows the error in the body', async () => {
    render(<Tool part={toolParts['output-error']} />);

    expect(screen.getByText('getWeather')).toBeInTheDocument();
    expect(screen.getByText(/failed/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /getWeather/ }));

    expect(screen.getByText('The weather service did not answer.')).toBeInTheDocument();
  });

  it('renders an input JSON cannot express instead of throwing', async () => {
    const part = {
      type: 'tool-getWeather',
      toolCallId: 'call_revision',
      state: 'input-available',
      input: { location: 'Kraków', revision: 12n },
    } as unknown as ToolPart;

    render(<Tool part={part} />);

    await userEvent.click(screen.getByRole('button', { name: /getWeather/ }));

    expect(screen.getByText(/"revision": "12"/)).toBeInTheDocument();
  });

  it('marks where a self-referencing output closes instead of throwing', async () => {
    const output: Record<string, unknown> = { temperatureC: 21 };

    output.self = output;

    const part = {
      type: 'tool-getWeather',
      toolCallId: 'call_getWeather',
      state: 'output-available',
      input: { location: 'Kraków' },
      output,
    } as unknown as ToolPart;

    render(<Tool part={part} />);

    await userEvent.click(screen.getByRole('button', { name: /getWeather/ }));

    expect(screen.getByText(/"self": "\[Circular\]"/)).toBeInTheDocument();
  });

  it('names a dynamic tool by its runtime-provided name', () => {
    render(<Tool part={dynamicToolParts['input-available']} />);

    expect(screen.getByText('lookup_order')).toBeInTheDocument();
  });

  it('marks a provider-executed call apart from a client call', () => {
    render(<Tool part={dynamicToolParts['output-available']} />);

    expect(screen.getByText(/provider-executed/)).toBeInTheDocument();
  });

  it('does not mark a client tool call as provider-executed', () => {
    render(<Tool part={toolParts['output-available']} />);

    expect(screen.queryByText(/provider-executed/)).toBeNull();
  });

  it('degrades to a readable fallback when the tool has no name', () => {
    const part = {
      type: 'tool-',
      toolCallId: 'call_unnamed',
      state: 'input-available',
      input: {},
    } as unknown as ToolPart;

    render(<Tool part={part} labels={{ unnamedTool: 'Unknown tool' }} />);

    expect(screen.getByText('Unknown tool')).toBeInTheDocument();
  });

  it('degrades to a readable fallback when a dynamic tool has no name', () => {
    const part = {
      type: 'dynamic-tool',
      toolName: '',
      toolCallId: 'call_unnamed',
      state: 'input-available',
      input: {},
    } as unknown as ToolPart;

    render(<Tool part={part} labels={{ unnamedTool: 'Unknown tool' }} />);

    expect(screen.getByText('Unknown tool')).toBeInTheDocument();
  });

  it('renders an unrecognised state without throwing', () => {
    const part = {
      type: 'tool-getWeather',
      toolCallId: 'call_getWeather',
      state: 'something-new',
      input: { location: 'Kraków' },
    } as unknown as ToolPart;

    expect(() => render(<Tool part={part} />)).not.toThrow();
    expect(screen.getByText('getWeather')).toBeInTheDocument();
  });

  it('translates every string it shows', () => {
    render(
      <Tool
        part={toolParts['input-streaming']}
        labels={{ running: 'działa', partialInput: 'Częściowe wejście' }}
      />,
    );

    expect(screen.getByText(/działa/)).toBeInTheDocument();

    return userEvent
      .click(screen.getByRole('button', { name: /getWeather/ }))
      .then(() => expect(screen.getByText('Częściowe wejście')).toBeInTheDocument());
  });

  it('leaves the expanded state to the app when it is controlled', async () => {
    const onOpenChange = vi.fn();

    render(<Tool part={toolParts['input-available']} open onOpenChange={onOpenChange} />);

    const trigger = screen.getByRole('button', { name: /getWeather/ });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders under server rendering without a browser', () => {
    const view = renderToString(<Tool part={toolParts['input-streaming']} />);

    expect(view).toContain('getWeather');
  });
});
