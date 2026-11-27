import { describe, expect, it } from 'vitest';

import { sourceParts, stepStartPart, textParts } from '../testing/ai-parts';
import { getCitations } from './citations';

describe('getCitations', () => {
  it('keeps the order the sources arrived in and numbers them from one', () => {
    const citations = getCitations([sourceParts.url, sourceParts.document]);

    expect(citations.map(({ marker, title }) => [marker, title])).toEqual([
      [1, 'Kraków forecast'],
      [2, 'Weather data policy'],
    ]);
  });

  it('collapses a source that arrives twice to a single citation', () => {
    const citations = getCitations([sourceParts.url, sourceParts.document, { ...sourceParts.url }]);

    expect(citations.map(({ marker, title }) => [marker, title])).toEqual([
      [1, 'Kraków forecast'],
      [2, 'Weather data policy'],
    ]);
  });

  it('collapses two ids that cite the same URL', () => {
    const citations = getCitations([
      sourceParts.url,
      { ...sourceParts.url, sourceId: 'source_forecast_again' },
    ]);

    expect(citations).toHaveLength(1);
  });

  it('names an untitled page by its URL', () => {
    const [citation] = getCitations([{ ...sourceParts.url, title: undefined }]);

    expect(citation?.title).toBe('https://example.com/krakow-forecast');
  });

  it('names a document without a title by its file, then by its media type', () => {
    const [untitled] = getCitations([{ ...sourceParts.document, title: '  ' }]);
    const [nameless] = getCitations([{ ...sourceParts.document, title: '', filename: undefined }]);

    expect(untitled?.title).toBe('weather-data-policy.pdf');
    expect(nameless?.title).toBe('application/pdf');
  });

  it('ignores the parts of a message that are not sources', () => {
    const citations = getCitations([stepStartPart, textParts.done, sourceParts.document]);

    expect(citations.map(({ marker, title }) => [marker, title])).toEqual([
      [1, 'Weather data policy'],
    ]);
  });
});
