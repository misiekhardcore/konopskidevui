import { expect, screen, userEvent, within } from 'storybook/test';

import { getCitations } from '../../lib/citations';
import { sourceParts } from '../../testing/ai-parts';
import { CitationMarker, Sources } from './citations';

import type { CitationRender, DocumentHref } from './citations';
import type { Meta, StoryObj } from '@storybook/react-vite';

const [urlCitation, documentCitation] = getCitations([sourceParts.url, sourceParts.document]);

const siteLink: CitationRender = (citation) => (
  <a href={citation.url} className="text-sm underline underline-offset-4">
    {`See: ${citation.title}`}
  </a>
);

const servedDocuments: DocumentHref = (citation) =>
  citation.mediaType ? `/documents/${encodeURIComponent(citation.sourceId)}` : undefined;

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
    documentHref: {
      control: false,
      description: 'Where the app serves a document, so its marker becomes a download.',
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

/** An app that serves its documents turns the document's marker into a download. */
export const DownloadMarker: Story = {
  args: { citation: documentCitation, documentHref: servedDocuments },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const marker = canvas.getByRole('link', { name: 'Weather data policy, 2' });

    await expect(marker).toHaveAttribute('href', '/documents/source_policy');
    await expect(marker).toHaveAttribute('download', 'weather-data-policy.pdf');
    // The note is replaced by the download, not rendered beside it.
    await expect(canvas.queryByRole('note', { name: /Weather data policy/ })).toBeNull();
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

/** The list takes the same resolver, so its document markers download too. */
export const DocumentDownloads: StoryObj<typeof sourcesMeta> = {
  args: { parts: [sourceParts.url, sourceParts.document], documentHref: servedDocuments },
  render: (args) => <Sources {...args} />,
  play: async ({ canvasElement }) => {
    const items = within(within(canvasElement).getByRole('list', { name: 'Sources' })).getAllByRole(
      'listitem',
    );
    const pageMarker = within(items[0]).getByRole('link', { name: 'Kraków forecast, 1' });
    const documentMarker = within(items[1]).getByRole('link', {
      name: 'Weather data policy, 2',
    });

    await expect(documentMarker).toHaveAttribute('download', 'weather-data-policy.pdf');
    // The resolver answers for the page too, but a page is never a download.
    await expect(pageMarker).not.toHaveAttribute('download');
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
