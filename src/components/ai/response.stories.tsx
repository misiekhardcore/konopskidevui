import { expect, within } from 'storybook/test';

import { sourceParts } from '../../testing/ai-parts';
import { Response } from './response';

import type { CitationResolver, ResponsePart } from './response';
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

/** A part in flight: the last block is the one the caret follows. */
export const Streaming: Story = {
  args: {
    part: part(
      'The forecast is clear. Bring a jacket for the morning, and sunglasses for the afternoon.',
      'streaming',
    ),
    parts: [],
  },
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
 * A resolved marker and one whose source has not arrived: the first is a link,
 * the second stays the literal characters the model produced.
 */
export const Citations: Story = {
  // The one composition Chromatic snapshots for this component: the failure mode
  // of an unresolved marker is visual.
  parameters: { chromatic: { disableSnapshot: false } },
  args: {
    part: part('The forecast is clear [1], and the policy agrees [2].'),
    parts: [sourceParts.url],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: 'Kraków forecast, 1' })).toBeInTheDocument();
    await expect(canvasElement).toHaveTextContent('[2]');
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
    parts: [],
  },
  play: async ({ canvasElement }) => {
    const block = canvasElement.querySelector('[data-slot="code-block"]');

    await expect(block).not.toBeNull();
    await expect(
      within(block as HTMLElement).getByRole('button', { name: 'Copy' }),
    ).toBeInTheDocument();
  },
};
