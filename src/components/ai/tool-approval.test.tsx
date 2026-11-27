import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { dynamicToolParts, toolParts } from '../../testing/ai-parts';
import { ToolApproval } from './tool-approval';

import type { ToolApprovalPart } from './tool-approval';

const REASON_LABEL = 'Reason for declining (optional)';

describe('ToolApproval', () => {
  it('names the tool and shows the arguments a decision is about', () => {
    render(<ToolApproval part={toolParts['approval-requested']} />);

    expect(screen.getByText('getWeather')).toBeInTheDocument();
    expect(screen.getByText(/"location": "Kraków"/)).toBeInTheDocument();
    expect(
      screen.getByText('This tool reads the locations saved in your account.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('is waiting for your approval');
  });

  it('is a body, not a panel with a heading of its own', () => {
    render(<ToolApproval part={toolParts['approval-requested']} />);

    // A tool row owns the one-line summary; the card composes inside it, so it
    // must not repeat the tool name as a second heading.
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getAllByText('getWeather')).toHaveLength(1);
  });

  it('answers the request with the approval id', async () => {
    const onApprove = vi.fn();

    render(<ToolApproval part={toolParts['approval-requested']} onApprove={onApprove} />);

    await userEvent.click(screen.getByRole('button', { name: 'Approve' }));

    expect(onApprove).toHaveBeenCalledWith({ id: 'approval_getWeather' });
  });

  it('carries the typed reason when the request is declined', async () => {
    const onDeny = vi.fn();

    render(<ToolApproval part={toolParts['approval-requested']} onDeny={onDeny} />);

    await userEvent.type(screen.getByLabelText(REASON_LABEL), 'Not my location.');
    await userEvent.click(screen.getByRole('button', { name: 'Decline' }));

    expect(onDeny).toHaveBeenCalledWith({
      id: 'approval_getWeather',
      reason: 'Not my location.',
    });
  });

  it('declines without a reason when none was given', async () => {
    const onDeny = vi.fn();

    render(<ToolApproval part={toolParts['approval-requested']} onDeny={onDeny} />);

    await userEvent.click(screen.getByRole('button', { name: 'Decline' }));

    expect(onDeny).toHaveBeenCalledWith({ id: 'approval_getWeather' });
  });

  it('is operable with the keyboard', async () => {
    const onApprove = vi.fn();

    render(<ToolApproval part={toolParts['approval-requested']} onApprove={onApprove} />);

    screen.getByRole('button', { name: 'Approve' }).focus();
    expect(screen.getByRole('button', { name: 'Approve' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    expect(onApprove).toHaveBeenCalledWith({ id: 'approval_getWeather' });
  });

  it('reads as approved once the decision is recorded', () => {
    render(<ToolApproval part={toolParts['approval-responded']} />);

    expect(screen.getByRole('status')).toHaveTextContent('was approved');
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.queryByLabelText(REASON_LABEL)).toBeNull();
  });

  it('reads as declined and shows the recorded reason', () => {
    render(<ToolApproval part={toolParts['output-denied']} />);

    expect(screen.getByRole('status')).toHaveTextContent('was declined');
    expect(screen.getByText('Do not look up my location.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Decline' })).toBeNull();
  });

  it('announces the recorded decision when the part changes', () => {
    const { rerender } = render(<ToolApproval part={toolParts['approval-requested']} />);

    expect(screen.getByRole('status')).toHaveTextContent('is waiting for your approval');

    rerender(<ToolApproval part={toolParts['output-denied']} />);

    expect(screen.getByRole('status')).toHaveTextContent('was declined');
  });

  it('names a dynamic tool by its runtime name', () => {
    render(<ToolApproval part={dynamicToolParts['approval-requested']} />);

    expect(screen.getByText('lookup_order')).toBeInTheDocument();
  });

  it('disables its actions while the decision is being recorded', async () => {
    render(
      <ToolApproval
        part={toolParts['approval-requested']}
        onApprove={() => new Promise(() => {})}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Approve' }));

    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decline' })).toBeDisabled();
  });

  it('translates every string it shows', () => {
    render(
      <ToolApproval
        part={toolParts['approval-requested']}
        labels={{
          approve: 'Zatwierdź',
          decline: 'Odrzuć',
          requested: 'czeka na Twoją zgodę',
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Zatwierdź' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Odrzuć' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('czeka na Twoją zgodę');
  });

  it('renders nothing for a call that carries no approval', () => {
    const { container } = render(<ToolApproval part={toolParts['output-available']} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('degrades instead of rendering an empty arguments block', () => {
    const part = {
      ...toolParts['approval-requested'],
      input: {},
    } as unknown as ToolApprovalPart;

    const { container } = render(<ToolApproval part={part} />);

    expect(container.querySelector('[data-slot="code-block"]')).toBeNull();
    expect(screen.getByText('getWeather')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
  });

  it('renders under server rendering without a browser', () => {
    const view = renderToString(<ToolApproval part={toolParts['approval-requested']} />);

    expect(view).toContain('getWeather');
  });
});
