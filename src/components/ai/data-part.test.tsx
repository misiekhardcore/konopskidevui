import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { dataPart } from '../../testing/ai-parts';
import { DataPart } from './data-part';

import type { DataPartData } from './data-part';

/** The payload as the reader gets it, out of the code block's pre. */
function payload() {
  return document.querySelector('[data-slot="code-block-code"]')?.textContent;
}

describe('DataPart', () => {
  it('shows the part name, humanised, above its payload as JSON', () => {
    render(<DataPart part={dataPart} />);

    const name = screen.getByText('Weather');
    const json = document.querySelector('[data-slot="code-block-content"]');

    expect(name.compareDocumentPosition(json as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(payload()).toBe(
      '{\n  "location": "Kraków",\n  "temperatureC": 21,\n  "summary": "Clear"\n}',
    );
  });

  it('humanises a multi-word part name into a sentence', () => {
    const part = {
      type: 'data-lastSearchResults',
      data: { query: 'kraków' },
    } as DataPartData;

    render(<DataPart part={part} />);

    expect(screen.getByText('Last search results')).toBeInTheDocument();
  });

  it('falls back to a label when the part type names nothing', () => {
    const part = { type: 'data-', data: { ok: true } } as DataPartData;

    render(<DataPart part={part} />);

    expect(screen.getByText('Data')).toBeInTheDocument();
  });

  it('takes every string it shows from a label', () => {
    const part = {
      type: 'data-',
      data: {
        toJSON: () => {
          throw new Error('nope');
        },
      },
    };

    render(
      <DataPart
        part={part as unknown as DataPartData}
        labels={{ data: 'Payload', unreadable: 'No readable form' }}
      />,
    );

    expect(screen.getByText('Payload')).toBeInTheDocument();
    expect(screen.getByText('No readable form')).toBeInTheDocument();
  });

  it('keeps a large payload in a bounded scroller instead of overflowing the message', () => {
    const data = Object.fromEntries(
      Array.from({ length: 40 }, (_, index) => [`field${index}`, `value ${index}`]),
    );

    render(<DataPart part={{ type: 'data-report', data } as DataPartData} />);

    const scroller = document.querySelector('[data-slot="code-block-content"]');

    expect(scroller).toHaveClass('max-h-80');
    // The whole payload is in the DOM, so it is readable rather than truncated,
    // and the scroller is reachable without a mouse.
    expect(payload()).toContain('"field39": "value 39"');
    expect(scroller).toHaveAttribute('tabindex', '0');
  });

  it('lets a render prop replace the whole default rendering', () => {
    const { container } = render(
      <DataPart part={dataPart} render={(part) => <p data-testid="own">My {part.type} card</p>} />,
    );

    expect(screen.getByTestId('own')).toHaveTextContent('My data-weather card');
    expect(container.querySelector('[data-slot="code-block"]')).toBeNull();
    expect(container.querySelector('[data-slot="data-part"]')).toBeNull();
    expect(screen.queryByText('Weather')).toBeNull();
  });

  it('hands the same part to the render prop that it was given', () => {
    const seen: DataPartData[] = [];

    render(
      <DataPart
        part={dataPart}
        render={(part) => {
          seen.push(part);
          return null;
        }}
      />,
    );

    expect(seen).toEqual([dataPart]);
  });

  it('makes a payload JSON cannot express readable instead of throwing', () => {
    const part = {
      type: 'data-weather',
      data: { temperatureC: 21n, tags: [Symbol('clear')] },
    } as unknown as DataPartData;

    render(<DataPart part={part} />);

    expect(payload()).toBe('{\n  "temperatureC": "21",\n  "tags": [\n    "Symbol(clear)"\n  ]\n}');
  });

  it('marks where a self-referencing payload closes instead of throwing', () => {
    const data: Record<string, unknown> = { location: 'Kraków' };

    data.self = data;

    render(<DataPart part={{ type: 'data-weather', data } as DataPartData} />);

    expect(payload()).toBe('{\n  "location": "Kraków",\n  "self": "[Circular]"\n}');
  });

  it('degrades to a sentence when the payload cannot be read at all', () => {
    const part = {
      type: 'data-weather',
      data: {
        toJSON() {
          throw new Error('nope');
        },
      },
    } as unknown as DataPartData;

    render(<DataPart part={part} />);

    expect(payload()).toBe('This data cannot be shown');
  });

  it('forwards the rest of its props to the root element', () => {
    render(<DataPart part={dataPart} className="mt-4" data-testid="part" />);

    const root = screen.getByTestId('part');

    expect(root).toHaveAttribute('data-slot', 'data-part');
    expect(root).toHaveAttribute('data-part-type', 'data-weather');
    expect(root).toHaveClass('mt-4');
  });
});
