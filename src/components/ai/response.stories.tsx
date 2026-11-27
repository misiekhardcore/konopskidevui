import * as React from 'react';
import { expect, within } from 'storybook/test';

import { sourceParts } from '../../testing/ai-parts';
import { Response } from './response';

import type { CitationResolver, ResponsePart, ResponseProps } from './response';
import type { Meta, StoryObj } from '@storybook/react-vite';

const answer = `## The forecast

Kraków is **21 °C** and *clear*, according to the [forecast](https://example.com/krakow-forecast) [1].

- A light jacket for the morning
- Sunglasses for the afternoon
  1. The wind picks up after 16:00
  2. The UV index stays high

> A passing front may bring rain tomorrow.

| Day | Temp  | Sky   |
| --- | ----- | ----- |
| Mon | 21 °C | Clear |
| Tue | 19 °C | Rain  |

\`\`\`ts
const forecast = await getForecast('Kraków');
\`\`\``;

function part(text: string, state: ResponsePart['state'] = 'done'): ResponsePart {
  return { type: 'text', text, state };
}

/** How the story feeds the answer: small enough steps to read, quick enough to watch. */
const CHUNK = 6;
const TICK = 80;
/** A finished answer holds, then the story replays itself: it is watched, not read. */
const HOLD = 2000;

/**
 * Story-only: the text grows the way a provider sends it.
 *
 * The motion is CSS and lives in the component; without new chunks there is
 * nothing for it to animate, because `@starting-style` only runs for a block
 * that has just been inserted. This harness supplies the chunks so the fade, the
 * height ease and the caret can be watched in a story instead of imagined.
 */
function useStreamedText(text: string): string {
  const [length, setLength] = React.useState(() => Math.min(CHUNK, text.length));

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const advance = (from: number) => {
      timer = setTimeout(() => {
        if (cancelled) return;

        const next = Math.min(from + CHUNK, text.length);

        setLength(next);

        if (next < text.length) {
          advance(next);
          return;
        }

        timer = setTimeout(() => {
          if (cancelled) return;

          setLength(Math.min(CHUNK, text.length));
          advance(CHUNK);
        }, HOLD);
      }, TICK);
    };

    advance(Math.min(CHUNK, text.length));

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text]);

  return text.slice(0, length);
}

/** A story's part, with its text handed over chunk by chunk; the part's own state is kept. */
function StreamedResponse({ part: streamedPart, ...props }: ResponseProps) {
  const text = useStreamedText(streamedPart.text);

  return <Response part={{ ...streamedPart, text }} {...props} />;
}

const meta = {
  title: 'AI/Response',
  component: Response,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A text part, rendered as GFM while it streams. Markers in the prose resolve against the message’s sources with the documented `[n]` syntax, and a fenced block uses the library’s code block chrome without a highlighting peer.',
      },
    },
  },
  argTypes: {
    part: {
      control: false,
      description: 'The SDK text part, as `useChat` hands it over.',
      table: { category: 'Data' },
    },
    parts: {
      control: false,
      description: 'The message’s parts; only its sources are read.',
      table: { category: 'Data' },
    },
    resolveCitation: {
      control: false,
      description: 'How to find the markers; `[n]` when omitted.',
      table: { category: 'Rendering' },
    },
    renderMarker: {
      control: false,
      description: 'Replace the whole marker inside the prose.',
      table: { category: 'Rendering' },
    },
    documentHref: {
      control: false,
      description: 'Where the app serves a document, so its markers download.',
      table: { category: 'Rendering' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: { part: part(answer), parts: [sourceParts.url] },
} satisfies Meta<typeof Response>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every GFM block an answer uses, rendered as one finished part. */
export const Markdown: Story = {};

/**
 * A part in flight: every block arrives in turn, so a block that is new fades in
 * and the caret stays on the one the stream is writing.
 */
export const Streaming: Story = {
  args: { part: part(answer, 'streaming') },
  render: (args) => <StreamedResponse {...args} />,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="response"]');

    await expect(root).toHaveAttribute('data-state', 'streaming');

    // The caret is a pseudo-element on the last block, never a character in the
    // answer's text.
    const last = root?.lastElementChild as Element;

    await expect(getComputedStyle(last, '::after').content).not.toBe('none');
    // The motion itself is a review item, not a timing assertion (ADR 0015).
  },
};

/**
 * Both markers in one paragraph, resolved to the two sources the message carries:
 * a page is a link, and a document with no page of its own is a note.
 */
export const Citations: Story = {
  // The one composition Chromatic snapshots for this component: a marker's
  // alignment and its weight against the prose are what a snapshot can judge.
  parameters: { chromatic: { disableSnapshot: false } },
  args: {
    part: part('The forecast is clear [1], and the policy agrees [2].'),
    parts: [sourceParts.url, sourceParts.document],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: 'Kraków forecast, 1' })).toBeInTheDocument();
    await expect(canvas.getByRole('note', { name: 'Weather data policy, 2' })).toBeInTheDocument();
  },
};

/** A provider's own marker syntax is a resolver, not a fork of the component. */
export const ProviderSyntax: Story = {
  args: {
    part: part('The forecast is clear {{1}}.'),
    parts: [sourceParts.url],
    resolveCitation: ((text, citations) => {
      const citation = citations.find(({ marker }) => marker === 1);
      const start = text.indexOf('{{1}}');

      return citation && start !== -1 ? [{ start, end: start + '{{1}}'.length, citation }] : [];
    }) satisfies CitationResolver,
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Kraków forecast, 1' }),
    ).toBeInTheDocument();
  },
};

/** The app's own marker, usually its router's link, inside the prose. */
export const CustomMarker: Story = {
  args: {
    part: part('The forecast is clear [1].'),
    parts: [sourceParts.url],
    renderMarker: (citation) => (
      <a href={citation.url} className="text-sm underline underline-offset-4">
        {`See: ${citation.title}`}
      </a>
    ),
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'See: Kraków forecast' }),
    ).toBeInTheDocument();
  },
};

/** A fence still being typed is already the code block the finished one will be. */
export const UnfinishedFence: Story = {
  args: {
    part: part('Run the lookup:\n\n```ts\nconst forecast = await getForecast(', 'streaming'),
  },
  render: (args) => <StreamedResponse {...args} />,
  play: async ({ canvasElement }) => {
    // The fence opens a few chunks in, so wait for the chrome rather than
    // assuming the first chunk already contains it.
    const copy = await within(canvasElement).findByRole(
      'button',
      { name: 'Copy' },
      { timeout: 3000 },
    );

    await expect(copy).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="code-block"]')).not.toBeNull();
    await expect(canvasElement.querySelector('[data-slot="response"]')).toHaveAttribute(
      'data-state',
      'streaming',
    );
  },
};
