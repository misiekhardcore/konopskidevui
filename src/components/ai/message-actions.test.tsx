import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MessageActions } from './message-actions';

describe('MessageActions', () => {
  it('renders only the copy action when onCopy is provided', () => {
    render(<MessageActions onCopy={() => {}} copyValue="Hello world" />);
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /regenerate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('renders only the feedback action when onFeedback is provided', () => {
    render(<MessageActions onFeedbackUp={() => {}} />);
    expect(screen.getByRole('button', { name: /feedback/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });

  it('renders only the regenerate action when onRegenerate is provided', () => {
    render(<MessageActions onRegenerate={() => {}} />);
    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });

  it('renders only the edit action when onEdit is provided', () => {
    render(<MessageActions onEdit={() => {}} />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });

  it('calls onCopy when the copy button is clicked', async () => {
    const handleCopy = vi.fn();
    render(<MessageActions onCopy={handleCopy} copyValue="Hello world" />);
    await userEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(handleCopy).toHaveBeenCalled();
  });

  it('calls onRegenerate when the regenerate button is clicked', async () => {
    const handleRegenerate = vi.fn();
    render(<MessageActions onRegenerate={handleRegenerate} />);
    await userEvent.click(screen.getByRole('button', { name: /regenerate/i }));
    expect(handleRegenerate).toHaveBeenCalled();
  });

  it('calls onEdit when the edit button is clicked', async () => {
    const handleEdit = vi.fn();
    render(<MessageActions onEdit={handleEdit} />);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(handleEdit).toHaveBeenCalled();
  });

  it('calls onFeedback with an up vote when the feedback control is pressed', async () => {
    const handleFeedbackUp = vi.fn();
    render(<MessageActions onFeedbackUp={handleFeedbackUp} />);
    await userEvent.click(screen.getByRole('button', { name: /feedback/i }));
    expect(handleFeedbackUp).toHaveBeenCalled();
  });

  it('shows check icon after copy succeeds', async () => {
    const handleCopy = vi.fn();
    render(<MessageActions onCopy={handleCopy} copyValue="Hello world" />);

    const button = screen.getByRole('button', { name: /copy/i });
    expect(button).not.toHaveAttribute('data-copied');

    await userEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(button).toHaveAttribute('data-copied');
    expect(button).toHaveAttribute('aria-label', 'Copied');
  });
});
