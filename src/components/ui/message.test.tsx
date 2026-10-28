import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Message, MessageAvatar, MessageContent } from './message';

describe('Message', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <Message align="start">
        <MessageAvatar>AL</MessageAvatar>
        <MessageContent>Hello</MessageContent>
      </Message>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <Message align="start">
        <MessageAvatar>AL</MessageAvatar>
        <MessageContent>Hello</MessageContent>
      </Message>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });
});
