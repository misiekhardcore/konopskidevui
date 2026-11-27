import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MessageActions } from './message-actions';

describe('MessageActions', () => {
  it('renders nothing when no handlers are provided', () => {
    const { container } = render(<MessageActions />);
    expect(container.firstChild).toBeNull();
  });

  it('renders only the copy action when onCopy is provided', () => {
    render(<MessageActions onCopy={() => {}} copyValue="Hello world" />);
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /regenerate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
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
    const handleFeedback = vi.fn();
    render(<MessageActions onFeedback={handleFeedback} />);
    await userEvent.click(screen.getByRole('button', { name: /feedback/i }));
    expect(handleFeedback).toHaveBeenCalledWith('up');
  });
});