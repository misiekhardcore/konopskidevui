import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
} from './message-scroller';

describe('MessageScroller', () => {
  it('renders a composed instance', () => {
    const { container } = render(
      <MessageScrollerProvider>
        <MessageScroller className="h-32 w-64">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <MessageScrollerItem>One</MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>,
    );

    expect(container.firstElementChild).not.toBeNull();
  });

  it('marks the root with its data-slot hook', () => {
    const { container } = render(
      <MessageScrollerProvider>
        <MessageScroller className="h-32 w-64">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <MessageScrollerItem>One</MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>,
    );

    expect(container.querySelector('[data-slot]')).not.toBeNull();
  });

  it('renders its items inside the viewport', async () => {
    render(
      <MessageScrollerProvider>
        <MessageScroller className="h-32 w-64">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <MessageScrollerItem>First message</MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>,
    );

    expect(screen.getByText('First message')).toBeInTheDocument();
  });
});
