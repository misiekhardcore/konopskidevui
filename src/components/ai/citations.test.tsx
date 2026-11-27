import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { getCitations } from '../../lib/citations';
import { sourceParts } from '../../testing/ai-parts';
import { CitationMarker, Sources } from './citations';

const [urlCitation, documentCitation] = getCitations([sourceParts.url, sourceParts.document]);

describe('CitationMarker', () => {
  it('shows its one-based number and is named by the source title', () => {
    render(<CitationMarker citation={urlCitation} />);

    const marker = screen.getByRole('link', { name: /Kraków forecast/ });

    // The visible number is part of the name because WCAG 2.5.3 requires it,
    // but the name is never the bare number.
    expect(marker).toHaveAccessibleName('Kraków forecast, 1');
    expect(marker).not.toHaveAccessibleName('1');
    expect(marker).toHaveTextContent('1');
    expect(marker).toHaveAttribute('href', 'https://example.com/krakow-forecast');
  });

  it('previews the title and the URL on hover', async () => {
    render(<CitationMarker citation={urlCitation} />);

    await userEvent.hover(screen.getByRole('link', { name: /Kraków forecast/ }));

    const preview = await screen.findByRole('tooltip');

    expect(preview).toHaveTextContent('Kraków forecast');
    expect(preview).toHaveTextContent('https://example.com/krakow-forecast');
  });

  it('previews on keyboard focus, so the pointer is not required', async () => {
    render(<CitationMarker citation={urlCitation} />);

    await userEvent.tab();

    const preview = await screen.findByRole('tooltip');

    expect(preview).toHaveTextContent('Kraków forecast');
    expect(screen.getByRole('link', { name: /Kraków forecast/ })).toHaveFocus();
  });

  it('names and previews a document by its title and file', async () => {
    render(<CitationMarker citation={documentCitation} />);

    await userEvent.tab();

    expect(screen.getByRole('note', { name: /Weather data policy/ })).toHaveTextContent('2');
    expect(await screen.findByRole('tooltip')).toHaveTextContent('weather-data-policy.pdf');
  });

  it('replaces its whole rendering with the given override', () => {
    render(
      <CitationMarker
        citation={urlCitation}
        render={(citation) => <button type="button">{`cited: ${citation.title}`}</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'cited: Kraków forecast' })).toBeInTheDocument();
    // The override replaces the marker, it does not sit beside the default one.
    expect(screen.queryByRole('link', { name: /Kraków forecast/ })).toBeNull();
  });

  it('renders under server rendering without a browser', () => {
    const view = renderToString(<CitationMarker citation={urlCitation} />);

    expect(view).toContain('Kraków forecast');
  });
});

describe('Sources', () => {
  it('lists both source kinds once each, in arrival order, numbered from one', () => {
    render(<Sources parts={[sourceParts.url, sourceParts.document, { ...sourceParts.url }]} />);

    const list = screen.getByRole('list', { name: 'Sources' });
    const items = within(list).getAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('1Kraków forecast');
    expect(items[0]).toHaveTextContent('https://example.com/krakow-forecast');
    expect(items[1]).toHaveTextContent('2Weather data policy');
    expect(items[1]).toHaveTextContent('weather-data-policy.pdf');
  });

  it('renders nothing when the message cited nothing', () => {
    const { container } = render(<Sources parts={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('falls back to the media type when a document has no filename', () => {
    render(<Sources parts={[{ ...sourceParts.document, filename: undefined }]} />);

    expect(screen.getByRole('listitem')).toHaveTextContent('application/pdf');
  });

  it('takes the marker override for the list markers too', () => {
    render(
      <Sources
        parts={[sourceParts.document]}
        renderMarker={(citation) => <span>marker {citation.marker}</span>}
      />,
    );

    expect(screen.getByText('marker 1')).toBeInTheDocument();
    expect(screen.queryByRole('note', { name: /Weather data policy/ })).toBeNull();
  });

  it('translates the heading and names the list with it', () => {
    render(<Sources parts={[sourceParts.url]} labels={{ title: 'Źródła' }} />);

    expect(screen.getByRole('list', { name: 'Źródła' })).toBeInTheDocument();
    expect(screen.getByText('Źródła')).toBeInTheDocument();
  });

  it('renders under server rendering without a browser', () => {
    const view = renderToString(<Sources parts={[sourceParts.url]} />);

    expect(view).toContain('Sources');
    expect(view).toContain('Kraków forecast');
  });
});
