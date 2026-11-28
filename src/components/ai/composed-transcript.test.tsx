import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { reasoningParts, sourceParts, textParts, toolParts } from '../../testing/ai-parts';
import { Message, MessageContent, MessageGroup } from '../ui/message';
import { Sources } from './citations';
import { Reasoning } from './reasoning';
import { Response } from './response';
import { Tool } from './tool';

import type { ToolPart } from './tool';

/**
 * The composed seam the spec names: every AI module in one message, rendered
 * from the shared fixtures, so the family is proven to read as a conversation
 * rather than as a set of widgets that happen to share a screen.
 *
 * This suite asserts composition, not any module's internals: document order,
 * one layout owner, one numbering for the citations, focus that walks the
 * message once, and an approval that updates its card without disturbing the
 * answer around it.
 */

/** The message's parts, exactly as the SDK hands them over. */
const PARTS = [
  reasoningParts.done,
  toolParts['approval-requested'],
  textParts.cited,
  sourceParts.url,
  sourceParts.document,
] as const;

/**
 * The app's job, done the way an app does it: hold the part, answer the SDK,
 * and keep the row open so the decision it recorded stays in view.
 */
function AssistantMessage({ onApprove }: { onApprove?: (approval: { id: string }) => void }) {
  const [part, setPart] = React.useState<ToolPart>(toolParts['approval-requested']);
  const [open, setOpen] = React.useState(true);

  function handleApprove(approval: { id: string }) {
    onApprove?.(approval);
    setPart({ ...toolParts['approval-responded'], approval: { id: approval.id, approved: true } });
  }

  return (
    <MessageGroup>
      <Message role="article" aria-label="Assistant message">
        <MessageContent>
          <Reasoning part={reasoningParts.done} durationMs={4200} />
          <Tool part={part} open={open} onOpenChange={setOpen} onApprove={handleApprove} />
          <Response part={textParts.cited} parts={PARTS} />
          <Sources parts={PARTS} />
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}

function message() {
  return screen.getByRole('article', { name: 'Assistant message' });
}

function contentOf(scope: HTMLElement) {
  const content = scope.querySelector('[data-slot="message-content"]');

  if (!(content instanceof HTMLElement)) throw new Error('the message has no content element');

  return content;
}

function partSlots(scope: HTMLElement) {
  return [...contentOf(scope).children].map((element) => element.getAttribute('data-slot'));
}

describe('composed assistant transcript', () => {
  it('reads in document order and gives one container the gaps between parts', () => {
    render(<AssistantMessage />);

    const article = message();

    // The four parts are siblings, in the order a person reads them. Nothing
    // wraps a part on its way into the message, so the container's gap is the
    // only vertical rhythm between them and no part can add a second one.
    expect(partSlots(article)).toEqual(['reasoning', 'tool', 'response', 'sources']);

    const content = contentOf(article);
    const [reasoning, tool, response, sources] = [...content.children];

    expect(reasoning.parentElement).toBe(content);
    expect(tool.parentElement).toBe(content);
    expect(response.parentElement).toBe(content);
    expect(sources.parentElement).toBe(content);

    // Document order is reading order: the thought, then the call, then the
    // answer, then its sources.
    expect(reasoning.compareDocumentPosition(tool)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(tool.compareDocumentPosition(response)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(response.compareDocumentPosition(sources)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(reasoning).toHaveTextContent('Thought for 4.2s');
    expect(tool).toHaveTextContent('getWeather');
    expect(response).toHaveTextContent('The forecast for Kraków is 21 °C and clear');
    expect(sources).toHaveTextContent('Sources');
  });

  it('resolves the prose markers against the very list rendered beneath them', () => {
    render(<AssistantMessage />);

    const article = message();
    const response = article.querySelector('[data-slot="response"]');

    if (!(response instanceof HTMLElement)) throw new Error('the message has no response');

    const citedPage = within(response).getByRole('link', { name: 'Kraków forecast, 1' });
    const citedDocument = within(response).getByRole('note', { name: 'Weather data policy, 2' });
    const list = within(article).getByRole('list', { name: 'Sources' });
    const [pageSource, documentSource] = within(list).getAllByRole('listitem');

    // The marker answers the same source the list shows under the same number.
    expect(within(pageSource).getByRole('link', { name: 'Kraków forecast, 1' })).toHaveAttribute(
      'href',
      'https://example.com/krakow-forecast',
    );
    expect(citedPage).toHaveAttribute('href', 'https://example.com/krakow-forecast');
    expect(
      within(documentSource).getByRole('note', { name: 'Weather data policy, 2' }),
    ).toHaveTextContent('2');
    expect(citedDocument).toHaveTextContent('2');
    expect(pageSource).toHaveTextContent('Kraków forecast');
    expect(documentSource).toHaveTextContent('weather-data-policy.pdf');
  });

  it('updates the approval card on approve without unmounting the answer around it', async () => {
    const onApprove = vi.fn();

    render(<AssistantMessage onApprove={onApprove} />);

    const article = message();
    const response = article.querySelector('[data-slot="response"]');
    const reasoning = article.querySelector('[data-slot="reasoning"]');
    const paragraph = response?.querySelector('p');
    const marker = within(response as HTMLElement).getByRole('link', {
      name: 'Kraków forecast, 1',
    });

    await userEvent.click(screen.getByRole('button', { name: 'Approve' }));

    expect(onApprove).toHaveBeenCalledWith({ id: 'approval_getWeather' });

    expect(within(article).getByRole('status')).toHaveTextContent('was approved');
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();

    // The decision reached the card; nothing around it was thrown away.
    expect(article.querySelector('[data-slot="response"]')).toBe(response);
    expect(response?.querySelector('p')).toBe(paragraph);
    expect(within(response as HTMLElement).getByRole('link', { name: 'Kraków forecast, 1' })).toBe(
      marker,
    );
    expect(article.querySelector('[data-slot="reasoning"]')).toBe(reasoning);
  });

  it('exposes one message rather than a stack of unrelated widgets', () => {
    render(<AssistantMessage />);

    const article = message();
    const focusables = [
      ...article.querySelectorAll<HTMLElement>('a[href], button, input, [tabindex="0"]'),
    ];

    expect(focusables.length).toBeGreaterThan(0);
    // Every control belongs to the one message; none of them escapes it.
    for (const focusable of focusables) expect(article.contains(focusable)).toBe(true);

    // One live region announces the approval; the answer cannot talk over it.
    expect(within(article).getAllByRole('status')).toHaveLength(1);
    // One source list, named once, is the message's only list.
    expect(within(article).getAllByRole('list')).toHaveLength(1);
  });

  it('walks the message once, in reading order, without collision', async () => {
    render(<AssistantMessage />);

    const article = message();
    const focusables = [
      ...article.querySelectorAll<HTMLElement>('a[href], button, input, [tabindex="0"]'),
    ];
    const visited: Element[] = [];

    for (let step = 0; step < focusables.length; step += 1) {
      await userEvent.tab();
      visited.push(document.activeElement as Element);
    }

    // Each control is reached exactly once, in the order it is read.
    expect(visited).toEqual(focusables);
    expect(new Set(visited).size).toBe(focusables.length);
  });
});
