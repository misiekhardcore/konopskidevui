import { expect, screen, userEvent, within } from 'storybook/test';

import { getCitations } from '../../lib/citations';
import { sourceParts } from '../../testing/ai-parts';
import { CitationMarker, Sources } from './citations';

import type { CitationRender } from './citations';
import type { Meta, StoryObj } from '@storybook/react-vite';

const [urlCitation, documentCitation] = getCitations([sourceParts.url, sourceParts.document]);

const siteLink: CitationRender = (citation) => (
  <a href={citation.url} className="text-sm underline underline-offset-4">
    {`See: ${citation.title}`}
  </a>
);

const meta = {
  title: 'AI/CitationMarker',
  component: CitationMarker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The one-based marker a source is cited by. It shows its number but is named by the source title, previews the title and where it came from on hover and on keyboard focus, and takes a `render` override that replaces it entirely — the same override the response applies to the markers inside its prose.',
      },
    },
  },
  argTypes: {
    citation: {
      control: false,
      description: 'The resolved citation the marker points at.',
      table: { category: 'Data' },
    },
    render: {
      control: false,
      description: 'Replace the whole marker with your own rendering.',
      table: { category: 'Rendering' },
    },
    className: { control: false, table: { category: 'Styling' } },
  },
  args: { citation: urlCitation },
} satisfies Meta<typeof CitationMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A page citation: the number, and the title and URL on hover. */
export const Marker: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(canvas.getByRole('link', { name: /Kraków forecast/ }));

    const preview = await screen.findByRole('tooltip');

    await expect(preview).toHaveTextContent('Kraków forecast');
    await expect(preview).toHaveTextContent('https://example.com/krakow-forecast');
  },
};

/** A document has no page to open, so it previews its file instead of linking out. */
export const DocumentMarker: Story = {
  args: { citation: documentCitation },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(canvas.getByRole('note', { name: /Weather data policy/ }));

    await expect(await screen.findByRole('tooltip')).toHaveTextContent('weather-data-policy.pdf');
  },
};

/** An app can replace the marker, usually with its own router's link. */
export const CustomMarker: Story = {
  args: { render: siteLink },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: 'See: Kraków forecast' })).toBeInTheDocument();
    await expect(canvas.queryByRole('link', { name: 'Kraków forecast, 1' })).toBeNull();
  },
};

const sourcesMeta = {
  component: Sources,
} as const satisfies Partial<Meta<typeof Sources>>;

/** The message's sources: one entry per source, in arrival order, numbered from one. */
export const List: StoryObj<typeof sourcesMeta> = {
  // The one composition Chromatic snapshots for the citation family.
  parameters: { chromatic: { disableSnapshot: false } },
  args: { parts: [sourceParts.url, sourceParts.document, { ...sourceParts.url }] },
  // The typed meta above only names Sources to the type checker and the story
  // guard; Storybook renders this file's default component, so the list is
  // mounted here.
  render: (args) => <Sources {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = within(canvas.getByRole('list', { name: 'Sources' })).getAllByRole('listitem');

    // The repeated URL is one citation, not a second number.
    await expect(items).toHaveLength(2);
    await expect(items[1]).toHaveTextContent('weather-data-policy.pdf');
  },
};

/** The list takes the same marker override the response uses. */
export const CustomMarkers: StoryObj<typeof sourcesMeta> = {
  args: {
    parts: [sourceParts.url],
    renderMarker: (citation) => <span className="text-xs">{`marker ${citation.marker}`}</span>,
  },
  render: (args) => <Sources {...args} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('marker 1')).toBeInTheDocument();
  },
};

/** With nothing cited the list renders nothing, so it can be mounted unconditionally. */
export const NothingCited: StoryObj<typeof sourcesMeta> = {
  args: { parts: [] },
  render: (args) => <Sources {...args} />,
  play: async ({ canvasElement }) => {
    // Nothing is left on the page, not even an empty list frame.
    await expect(canvasElement.querySelector('[data-slot="sources"]')).toBeNull();
    await expect(within(canvasElement).queryByRole('list')).toBeNull();
  },
};
