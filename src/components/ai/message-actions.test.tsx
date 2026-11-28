import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MessageActions } from './message-actions';

import type { MessageFeedbackVote } from './message-actions';

/** The app owns the recorded vote, so the row is mounted with real state. */
function VoteRow({ initial = null }: { initial?: MessageFeedbackVote | null }) {
  const [vote, setVote] = useState<MessageFeedbackVote | null>(initial);

  return <MessageActions feedback={vote} onFeedbackChange={setVote} />;
}

describe('MessageActions', () => {
  it('renders nothing when the app wires no action', () => {
    const { container } = render(<MessageActions />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the only handler has nothing to act on', () => {
    // A copy handler without the message text could only render a dead button,
    // which is exactly what this row must not do.
    const { container } = render(<MessageActions onCopy={() => {}} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders only the actions the app wires up', () => {
    render(<MessageActions copyValue="Hello world" onCopy={() => {}} onRegenerate={() => {}} />);

    expect(screen.getByRole('button', { name: 'Copy message' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Regenerate message' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit message' })).toBeNull();
    expect(screen.queryByRole('group', { name: 'Message feedback' })).toBeNull();
  });

  it('writes the message text when copy is pressed', async () => {
    const write = vi.fn();

    render(<MessageActions copyValue="The answer" onCopy={write} />);

    await userEvent.click(screen.getByRole('button', { name: 'Copy message' }));

    expect(write).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledWith('The answer');
  });

  it('confirms the copy visibly and announces it to assistive technology', async () => {
    render(<MessageActions copyValue="The answer" onCopy={() => {}} />);

    const copy = screen.getByRole('button', { name: 'Copy message' });
    expect(copy).not.toHaveAttribute('data-copied');
    expect(screen.getByRole('status')).toHaveTextContent('');

    await userEvent.click(copy);

    expect(copy).toHaveAttribute('data-copied');
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard');
  });

  it('confirms only once the write has completed', async () => {
    let finishWrite: (() => void) | undefined;
    const write = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishWrite = resolve;
        }),
    );

    render(<MessageActions copyValue="The answer" onCopy={write} />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy message' }));

    expect(screen.getByRole('status')).toHaveTextContent('');

    finishWrite?.();

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard');
    });
  });

  it('does not claim success when the write fails', async () => {
    const write = vi.fn(() => Promise.reject(new Error('Clipboard blocked')));

    render(<MessageActions copyValue="The answer" onCopy={write} />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy message' }));

    await waitFor(() => {
      expect(write).toHaveBeenCalled();
    });

    expect(screen.getByRole('button', { name: 'Copy message' })).not.toHaveAttribute('data-copied');
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('is one feedback control whose pressed state reflects the current vote', () => {
    render(<VoteRow initial="up" />);

    expect(screen.getByRole('group', { name: 'Message feedback' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Helpful' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Not helpful' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('replaces the vote instead of adding a second pressed control', async () => {
    render(<VoteRow />);

    await userEvent.click(screen.getByRole('button', { name: 'Helpful' }));

    expect(screen.getByRole('button', { name: 'Helpful' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Not helpful' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Not helpful' }));

    expect(screen.getByRole('button', { name: 'Helpful' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Not helpful' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('reports the vote it recorded', async () => {
    const onFeedbackChange = vi.fn();

    render(<MessageActions feedback={null} onFeedbackChange={onFeedbackChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Not helpful' }));

    expect(onFeedbackChange).toHaveBeenCalledWith('down');
  });

  it('emits regenerate and edit without changing what the message shows', async () => {
    const onRegenerate = vi.fn();
    const onEdit = vi.fn();

    render(
      <div>
        <p>The answer</p>
        <MessageActions onRegenerate={onRegenerate} onEdit={onEdit} />
      </div>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Regenerate message' }));
    await userEvent.click(screen.getByRole('button', { name: 'Edit message' }));

    expect(onRegenerate).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.getByText('The answer')).toBeInTheDocument();
  });

  it('gives every action a name and a keyboard path', async () => {
    const onEdit = vi.fn();

    render(<MessageActions copyValue="The answer" onCopy={() => {}} onEdit={onEdit} />);

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Copy message' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Edit message' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
