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

  it('flips the jump control for the start of the thread', () => {
    render(
      <MessageScrollerProvider>
        <MessageScroller className="h-32 w-64">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <MessageScrollerItem>First message</MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton direction="start" />
        </MessageScroller>
      </MessageScrollerProvider>,
    );

    expect(screen.getByRole('button', { name: 'Scroll to start' })).toBeInTheDocument();
  });

  it('takes a custom label and carries the button treatment it is given', () => {
    render(
      <MessageScrollerProvider>
        <MessageScroller className="h-32 w-64">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <MessageScrollerItem>First message</MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton variant="outline" size="sm" render={<button />}>
            Jump to the latest
          </MessageScrollerButton>
        </MessageScroller>
      </MessageScrollerProvider>,
    );

    const button = screen.getByRole('button', { name: 'Jump to the latest' });
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-size', 'sm');
  });

  it('marks the item the view anchors on', () => {
    render(
      <MessageScrollerProvider>
        <MessageScroller className="h-32 w-64">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <MessageScrollerItem messageId="m1" scrollAnchor>
                Anchored
              </MessageScrollerItem>
              <MessageScrollerItem messageId="m2">Plain</MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>,
    );

    const items = document.querySelectorAll('[data-slot="message-scroller-item"]');
    expect(items[0]).toHaveAttribute('data-scroll-anchor', 'true');
    expect(items[1]).toHaveAttribute('data-scroll-anchor', 'false');
  });
});
