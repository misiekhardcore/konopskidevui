import type { SourceDocumentUIPart, SourceUrlUIPart } from 'ai';

/**
 * The two source kinds a message can carry: a page the model cited, and a
 * document it was given or retrieved.
 */
export type SourcePart = SourceUrlUIPart | SourceDocumentUIPart;

/**
 * Anything that carries a part `type`, so a message's whole `parts` array can be
 * resolved without filtering first. Only the two source kinds are read.
 *
 * The open index signature is what makes that possible: a union of just the two
 * source kinds would reject the other parts of a message, and a bare
 * `{ type: string }` would reject a source the app has already widened.
 */
export type SourceInputPart = { type: string; [property: string]: unknown };

/** One source, resolved into the citation a marker points at. */
export type Citation = {
  /** One-based, in the order the sources arrived, matching the response's markers. */
  marker: number;
  /** The id the source arrived with. */
  sourceId: string;
  /** The source's name: the preview and the marker's accessible name. */
  title: string;
  /** The page a `source-url` cites; a document source has no URL. */
  url?: string;
  /** A document's media type. */
  mediaType?: string;
  /** A document's filename, when it has one. */
  filename?: string;
};

/** Narrowing for a raw part, so a caller never has to repeat the type string. */
export function isSourcePart(part: SourceInputPart): part is SourcePart {
  return part.type === 'source-url' || part.type === 'source-document';
}

/** An untitled source is still named: by its URL, or by the file it came from. */
function titleOf(part: SourcePart): string {
  const title = part.title?.trim();

  if (title) return title;

  return part.type === 'source-url' ? part.url : (part.filename ?? part.mediaType);
}

/**
 * The identities a source can be recognised by. A URL source is the same
 * citation when the same page is cited again under a new id; a document has no
 * page to compare, so its id is its identity.
 */
function identitiesOf(part: SourcePart): string[] {
  return part.type === 'source-url'
    ? [`id:${part.sourceId}`, `url:${part.url}`]
    : [`id:${part.sourceId}`];
}

/**
 * A message's sources as one ordered, deduplicated citation list.
 *
 * Numbering is one-based and follows arrival order, which is what the response's
 * inline markers resolve against; a source the provider streams twice keeps its
 * first position instead of taking a second number.
 */
export function getCitations(parts: readonly SourceInputPart[]): Citation[] {
  const citations: Citation[] = [];
  const seen = new Set<string>();

  for (const part of parts) {
    if (!isSourcePart(part)) continue;

    const identities = identitiesOf(part);

    if (identities.some((identity) => seen.has(identity))) continue;

    for (const identity of identities) seen.add(identity);

    citations.push({
      marker: citations.length + 1,
      sourceId: part.sourceId,
      title: titleOf(part),
      ...(part.type === 'source-url'
        ? { url: part.url }
        : { mediaType: part.mediaType, filename: part.filename }),
    });
  }

  return citations;
}
