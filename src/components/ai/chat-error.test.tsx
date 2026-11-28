import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ChatError } from './chat-error';

/** Text a provider sent, which the app has not translated before handing it over. */
const PROVIDER_TEXT = 'Upstream service unavailable: quota exhausted (429, request 4f2c)';

describe('ChatError', () => {
  it('shows the message it was given, word for word', () => {
    render(<ChatError error={PROVIDER_TEXT} />);

    const alert = screen.getByRole('alert');

    expect(alert.textContent).toContain(PROVIDER_TEXT);
    expect(screen.getByText(PROVIDER_TEXT)).toBeInTheDocument();
  });

  it('reads the message off an error object', () => {
    render(<ChatError error={new Error(PROVIDER_TEXT)} />);

    expect(screen.getByText(PROVIDER_TEXT)).toBeInTheDocument();
  });

  it('is announced as a destructive alert, not merely a red panel', () => {
    render(<ChatError error={PROVIDER_TEXT} />);

    const alert = screen.getByRole('alert');

    expect(alert).toBeInTheDocument();
    expect(alert.className).toContain('text-destructive');
  });

  it('renders no action at all when the app wires neither', () => {
    render(<ChatError error={PROVIDER_TEXT} />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('offers only the action the app wires', () => {
    render(<ChatError error={PROVIDER_TEXT} onRetry={() => {}} />);

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
  });

  it('offers dismiss alone when retry is not wired', () => {
    render(<ChatError error={PROVIDER_TEXT} onDismiss={() => {}} />);

    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });

  it('emits retry exactly once per activation', async () => {
    const onRetry = vi.fn();

    render(<ChatError error={PROVIDER_TEXT} onRetry={onRetry} onDismiss={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it('emits dismiss exactly once per activation', async () => {
    const onDismiss = vi.fn();

    render(<ChatError error={PROVIDER_TEXT} onRetry={() => {}} onDismiss={onDismiss} />);

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('keeps its actions reachable from the keyboard', async () => {
    const onRetry = vi.fn();

    render(<ChatError error={PROVIDER_TEXT} onRetry={onRetry} onDismiss={() => {}} />);

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Try again' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('falls back to a readable message when the error carries none', () => {
    const { rerender } = render(<ChatError />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The conversation could not continue. Please try again.',
    );

    rerender(<ChatError error="   " />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The conversation could not continue. Please try again.',
    );
  });

  it('takes the fallback and the action names from labels', async () => {
    const onRetry = vi.fn();

    render(
      <ChatError
        error=""
        labels={{ fallback: 'Połączenie zerwane', retry: 'Ponów' }}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Połączenie zerwane');

    await userEvent.click(screen.getByRole('button', { name: 'Ponów' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('forwards the wrapper props it is given', () => {
    render(
      <ChatError error={PROVIDER_TEXT} className="my-error" data-testid="conversation-error" />,
    );

    const alert = screen.getByRole('alert');

    expect(alert).toHaveAttribute('data-testid', 'conversation-error');
    expect(alert.className).toContain('my-error');
  });
});
