import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from './message-scroller';

describe('MessageScroller', () => {
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

  it('names the jump-to-end control for assistive tech', () => {
    render(
      <MessageScrollerProvider>
        <MessageScroller className="h-32 w-64">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <MessageScrollerItem>First message</MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>,
    );

    expect(screen.getByRole('button', { name: 'Scroll to end' })).toBeInTheDocument();
  });
});
