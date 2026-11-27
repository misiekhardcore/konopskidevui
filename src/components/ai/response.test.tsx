import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { sourceParts, textParts } from '../../testing/ai-parts';
import { Response } from './response';

import type { CitationResolver, ResponsePart } from './response';

function textPart(text: string, state: ResponsePart['state'] = 'done'): ResponsePart {
  return { type: 'text', text, state };
}

describe('Response', () => {
  it('renders a text part as a paragraph', () => {
    render(<Response part={textParts.done} />);

    expect(screen.getByText('The forecast for Kraków is 21 °C and clear.')).toBeInTheDocument();
  });

  it('renders headings, lists, tables, links, emphasis and blockquotes as GFM', () => {
    render(
      <Response
        part={textPart(`# Kraków

The **forecast** is *clear* and [sourced](https://example.com/krakow-forecast).

## Details

- first
- second
  1. nested
  2. nested

> Bring a jacket.

| Day | Temp  |
| --- | ----- |
| Mon | 21 °C |
| Tue | 19 °C |`)}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Kraków' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Details' })).toBeInTheDocument();
    expect(screen.getByText('forecast').tagName).toBe('STRONG');
    expect(screen.getByText('clear').tagName).toBe('EM');
    expect(screen.getByRole('link', { name: 'sourced' })).toHaveAttribute(
      'href',
      'https://example.com/krakow-forecast',
    );

    // Two lists, with the ordered one nested in the second bullet.
    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);

    expect(screen.getByText('Bring a jacket.').closest('blockquote')).not.toBeNull();

    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: 'Day' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '21 °C' })).toBeInTheDocument();
  });

  it('renders an unterminated fence as the code block chrome', () => {
    render(<Response part={textPart('Run this:\n\n```ts\nconst total = 1 + 1;\n', 'streaming')} />);

    const block = document.querySelector('[data-slot="code-block"]');

    expect(block).not.toBeNull();
    expect(within(block as HTMLElement).getByText('ts')).toBeInTheDocument();
    expect(block).toHaveTextContent('const total = 1 + 1;');
    expect(within(block as HTMLElement).getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    // The finished fence is a code block too, not a second kind of block.
  });

  it('keeps inline code inline rather than in the code block chrome', () => {
    render(<Response part={textPart('Run `pnpm test` before you ship.')} />);

    expect(screen.getByText('pnpm test').tagName).toBe('CODE');
    expect(document.querySelector('[data-slot="code-block"]')).toBeNull();
  });

  it('keeps a half-typed link literal until it completes', () => {
    const { container } = render(
      <Response part={textPart('See [the forecast](https://example.com/krak', 'streaming')} />,
    );

    expect(screen.queryByRole('link')).toBeNull();
    expect(container).toHaveTextContent('[the forecast](https://example.com/krak');
  });

  it('renders nothing for a part with no text', () => {
    const { container } = render(<Response part={textPart('')} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('reports whether it is streaming for the motion layer', () => {
    const { rerender } = render(<Response part={textPart('A', 'streaming')} />);

    expect(document.querySelector('[data-slot="response"]')).toHaveAttribute(
      'data-state',
      'streaming',
    );

    rerender(<Response part={textPart('A finished answer.')} />);

    expect(document.querySelector('[data-slot="response"]')).toHaveAttribute('data-state', 'done');
  });

  it('resolves a marker against the message sources', () => {
    render(<Response part={textPart('The forecast is clear [1].')} parts={[sourceParts.url]} />);

    const marker = screen.getByRole('link', { name: 'Kraków forecast, 1' });

    expect(marker).toHaveAttribute('href', 'https://example.com/krakow-forecast');
    expect(marker).toHaveTextContent('1');
  });

  it('resolves a marker inside emphasis, so the prose can cite anywhere', () => {
    render(
      <Response
        part={textPart('The forecast is **clear [1]** today.')}
        parts={[sourceParts.url]}
      />,
    );

    const emphasis = document.querySelector('strong') as HTMLElement;

    expect(emphasis).toHaveTextContent('clear 1');
    expect(within(emphasis).getByRole('link', { name: 'Kraków forecast, 1' })).toBeInTheDocument();
  });

  it('keeps a marker whose source has not arrived literal, then upgrades it', () => {
    const { container, rerender } = render(
      <Response part={textPart('The forecast is clear [2].')} parts={[sourceParts.url]} />,
    );

    expect(container).toHaveTextContent('[2]');
    expect(screen.queryByRole('link', { name: /Weather data policy/ })).toBeNull();

    rerender(
      <Response
        part={textPart('The forecast is clear [2].')}
        parts={[sourceParts.url, sourceParts.document]}
      />,
    );

    // A document has no page of its own, so its marker is a note until the app
    // says where it serves the file.
    expect(screen.getByRole('note', { name: 'Weather data policy, 2' })).toBeInTheDocument();
  });

  it('keeps unfamiliar and malformed markers as literal characters', () => {
    const { container } = render(
      <Response
        part={textPart('See [abc], [0], [3] and a half-typed [1.')}
        parts={[sourceParts.url]}
      />,
    );

    expect(container).toHaveTextContent('See [abc], [0], [3] and a half-typed [1.');
    expect(screen.queryByRole('link', { name: /Kraków forecast/ })).toBeNull();
  });

  it('takes a resolver for a provider with its own marker syntax', () => {
    const resolveCitation: CitationResolver = (text, citations) => {
      const citation = citations.find(({ marker }) => marker === 1);
      const start = text.indexOf('{{1}}');

      return citation && start !== -1 ? [{ start, end: start + '{{1}}'.length, citation }] : [];
    };

    render(
      <Response
        part={textPart('The forecast is clear {{1}}.')}
        parts={[sourceParts.url]}
        resolveCitation={resolveCitation}
      />,
    );

    expect(screen.getByRole('link', { name: 'Kraków forecast, 1' })).toBeInTheDocument();
  });

  it('applies the marker override inside the prose', () => {
    render(
      <Response
        part={textPart('The forecast is clear [1].')}
        parts={[sourceParts.url]}
        renderMarker={(citation) => <button type="button">{`cited: ${citation.title}`}</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'cited: Kraków forecast' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Kraków forecast, 1' })).toBeNull();
  });

  it('applies the document resolver inside the prose', () => {
    render(
      <Response
        part={textPart('The policy says so [1].')}
        parts={[sourceParts.document]}
        documentHref={(citation) => `/documents/${citation.sourceId}`}
      />,
    );

    const marker = screen.getByRole('link', { name: 'Weather data policy, 1' });

    expect(marker).toHaveAttribute('href', '/documents/source_policy');
    expect(marker).toHaveAttribute('download', 'weather-data-policy.pdf');
  });

  it('never resolves a marker inside code', () => {
    render(
      <Response
        part={textPart('Write `cite [1]` like this:\n\n```md\nUse [1] to cite.\n```')}
        parts={[sourceParts.url]}
      />,
    );

    expect(screen.getByText('cite [1]').tagName).toBe('CODE');
    expect(document.querySelector('[data-slot="code-block"]')).toHaveTextContent(
      'Use [1] to cite.',
    );
    expect(screen.queryByRole('link', { name: 'Kraków forecast, 1' })).toBeNull();
  });

  it('keeps the rendered tree mounted while a chunk is appended', () => {
    const { rerender } = render(
      <Response part={textPart('The forecast is [1]', 'streaming')} parts={[sourceParts.url]} />,
    );

    const paragraph = document.querySelector('[data-slot="response"] > p');
    const marker = screen.getByRole('link', { name: 'Kraków forecast, 1' });

    rerender(
      <Response
        part={textPart('The forecast is [1] and clear.', 'streaming')}
        parts={[sourceParts.url]}
      />,
    );

    // The paragraph and the marker are the same DOM nodes, not re-created:
    // selection, scroll and focus survive the chunk.
    expect(document.querySelector('[data-slot="response"] > p')).toBe(paragraph);
    expect(screen.getByRole('link', { name: 'Kraków forecast, 1' })).toBe(marker);
    expect(paragraph).toHaveTextContent('The forecast is 1 and clear.');
  });

  it('appends a new block without remounting the ones already rendered', () => {
    const { rerender } = render(
      <Response part={textPart('The forecast is clear.', 'streaming')} />,
    );

    const firstParagraph = document.querySelector('[data-slot="response"] > p');

    rerender(
      <Response part={textPart('The forecast is clear.\n\nBring a jacket.', 'streaming')} />,
    );

    expect(document.querySelectorAll('[data-slot="response"] > p')).toHaveLength(2);
    expect(document.querySelector('[data-slot="response"] > p')).toBe(firstParagraph);
  });

  it('adds no characters to the text for the streaming caret', () => {
    const { container } = render(
      <Response part={textPart('The forecast is clear.', 'streaming')} />,
    );

    // The caret is painted by CSS, so it can never be selected or copied with
    // the answer.
    expect(container.textContent).toBe('The forecast is clear.');
  });

  it('turns a completed link into a link only once it is complete', () => {
    const { container, rerender } = render(
      <Response part={textPart('See [the forecast](https://example.com/kra', 'streaming')} />,
    );

    expect(screen.queryByRole('link')).toBeNull();
    expect(container).toHaveTextContent('[the forecast](https://example.com/kra');

    rerender(
      <Response part={textPart('See [the forecast](https://example.com/krakow).', 'streaming')} />,
    );

    expect(screen.getByRole('link', { name: 'the forecast' })).toHaveAttribute(
      'href',
      'https://example.com/krakow',
    );
  });

  it('renders under server rendering without a browser', () => {
    const view = renderToString(
      <Response part={textPart('The forecast is clear [1].')} parts={[sourceParts.url]} />,
    );

    expect(view).toContain('The forecast is clear');
    expect(view).toContain('Kraków forecast');
  });
});
