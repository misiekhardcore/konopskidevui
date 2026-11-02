import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from './message';

describe('Message', () => {
  it('publishes the side of the conversation it belongs to', () => {
    const { container, rerender } = render(<Message>On it.</Message>);

    expect(container.querySelector('[data-slot="message"]')).toHaveAttribute(
      'data-align',
      'start',
    );

    rerender(<Message align="end">On it.</Message>);

    expect(container.querySelector('[data-slot="message"]')).toHaveAttribute('data-align', 'end');
  });

  it('composes avatar, header, body and footer as one message', () => {
    render(
      <MessageGroup>
        <Message>
          <MessageAvatar>AL</MessageAvatar>
          <MessageContent>
            <MessageHeader>Ada · 09:41</MessageHeader>
            The tokens are merged.
            <MessageFooter>Edited</MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>,
    );

    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByText('Ada · 09:41')).toBeInTheDocument();
    expect(screen.getByText('The tokens are merged.')).toBeInTheDocument();
    expect(screen.getByText('Edited')).toBeInTheDocument();
  });

  it('keeps the group a plain container, not a list: the thread owns the semantics', () => {
    const { container } = render(
      <MessageGroup>
        <Message>Hello</Message>
      </MessageGroup>,
    );

    expect(container.querySelector('[data-slot="message-group"]')).not.toHaveAttribute('role');
  });
});
