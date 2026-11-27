'use client';

import { cn } from 'cn';
import { DownloadIcon, ExternalLinkIcon, FileIcon } from 'lucide-react';
import * as React from 'react';

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '../ui/attachment';
import { Audio } from '../ui/audio';
import { Button } from '../ui/button';
import { Video } from '../ui/video';

import type { FileUIPart } from 'ai';

/** The SDK's file part, as `useChat` hands it over. */
export type FilePartData = FileUIPart;

/** Every user-facing string, so the part can be translated without a fork. */
export type FilePartLabels = {
  /** The noun a nameless image is called by: `image/png` reads as "PNG image". */
  image: string;
  /** The noun a nameless audio file is called by. */
  audio: string;
  /** The noun a nameless video is called by. */
  video: string;
  /** The noun a nameless file of any other type is called by. */
  file: string;
  /** The open action's accessible name; `{name}` is where the file's name goes. */
  open: string;
  /** The download action's accessible name; `{name}` is where the file's name goes. */
  download: string;
  /** The description under a file that arrived without data. */
  missing: string;
  /** The audio play button's accessible name; `{name}` is where the file's name goes. */
  play: string;
  /** The audio pause button's accessible name. */
  pause: string;
  /** The audio seek slider's accessible name. */
  seek: string;
  /** The audio mute button's accessible name. */
  mute: string;
  /** The audio unmute button's accessible name. */
  unmute: string;
};

const DEFAULT_LABELS: FilePartLabels = {
  image: 'Image',
  audio: 'Audio',
  video: 'Video',
  file: 'File',
  open: 'Open {name}',
  download: 'Download {name}',
  missing: 'File data is missing',
  play: 'Play {name}',
  pause: 'Pause {name}',
  seek: 'Seek {name}',
  mute: 'Mute {name}',
  unmute: 'Unmute {name}',
};

// `part` is also a DOM attribute, so it has to leave the forwarded props or the
// element's `part?: string` would be intersected into the file part.
export type FilePartProps = Omit<React.ComponentProps<'figure'>, 'children' | 'part'> & {
  part: FilePartData;
  /** Override the strings shown, one at a time. */
  labels?: Partial<FilePartLabels>;
};

/**
 * A file part is one file with no quality ladder. The player reads a rendition's
 * height only to name a quality, and a single rendition offers no menu, so the
 * part names none rather than inventing a resolution for the model's file.
 */
const NO_RENDITION_HEIGHT = 0;

/** Which renderer a media type asks for; everything not media falls back. */
type MediaKind = 'image' | 'audio' | 'video' | 'file';

function mediaKindOf(mediaType: string): MediaKind {
  const type = mediaType.split(';')[0].trim().toLowerCase();

  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('audio/')) return 'audio';
  if (type.startsWith('video/')) return 'video';

  return 'file';
}

/** A readable name for a part with no filename: `image/png` → "PNG image". */
function mediaNameOf(mediaType: string, labels: FilePartLabels): string {
  const [top = '', subtype = ''] = mediaType.split(';')[0].trim().toLowerCase().split('/');
  const kind =
    top === 'image'
      ? labels.image
      : top === 'audio'
        ? labels.audio
        : top === 'video'
          ? labels.video
          : labels.file;
  const detail = subtype.trim().toUpperCase();

  return detail ? `${detail} ${kind.toLowerCase()}` : kind;
}

/** The part's filename, or the media type read out, so a name is never blank. */
function nameOf(part: FilePartData, labels: FilePartLabels): string {
  const filename = part.filename?.trim();

  return filename || mediaNameOf(part.mediaType, labels);
}

/** An action's accessible name, with the file's name where the label asks for it. */
function actionLabelOf(template: string, name: string): string {
  return template.replace('{name}', name);
}

/** True for a `data:` URL, which a browser refuses to open as a top-level document. */
function isDataUrl(url: string): boolean {
  return url.startsWith('data:');
}

/** A data URL's payload as a Blob, or null when the URL cannot be decoded. */
function blobOf(dataUrl: string): Blob | null {
  const match = /^data:([^;,]*)(;base64)?,([\s\S]*)$/.exec(dataUrl);

  if (!match) return null;

  const [, mediaType = 'application/octet-stream', base64, payload = ''] = match;

  try {
    if (base64) {
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);

      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }

      return new Blob([bytes], { type: mediaType });
    }

    return new Blob([decodeURIComponent(payload)], { type: mediaType });
  } catch {
    return null;
  }
}

/**
 * A URL the browser will open: a hosted file is used as it arrived, and an
 * embedded one becomes an object URL. The object URL is created in an effect and
 * revoked when the part changes or the component unmounts, so none outlives it.
 */
function useOpenableUrl(url: string): string {
  const [object, setObject] = React.useState<{ source: string; url: string } | null>(null);

  React.useEffect(() => {
    if (!isDataUrl(url) || typeof URL.createObjectURL !== 'function') return;

    const blob = blobOf(url);

    if (!blob) return;

    const objectUrl = URL.createObjectURL(blob);

    // The URL can only be created after mount, and the links that use it are
    // rendered from this state; the effect's cleanup revokes it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObject({ source: url, url: objectUrl });

    return () => URL.revokeObjectURL(objectUrl);
  }, [url]);

  // The state trails the render by one frame, so it is only trusted while it
  // still describes the URL being rendered.
  return object?.source === url ? object.url : url;
}

/** Open and download, as ordinary links: the app owns where the file goes. */
function FileActions({
  href,
  name,
  openLabel,
  downloadLabel,
}: {
  href: string;
  name: string;
  openLabel: string;
  downloadLabel: string;
}) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <Button asChild variant="ghost" size="icon-xs">
        <a href={href} target="_blank" rel="noreferrer noopener" aria-label={openLabel}>
          <ExternalLinkIcon aria-hidden="true" />
        </a>
      </Button>
      <Button asChild variant="ghost" size="icon-xs">
        <a href={href} download={name} aria-label={downloadLabel}>
          <DownloadIcon aria-hidden="true" />
        </a>
      </Button>
    </span>
  );
}

/**
 * A file the model produced, rendered by its media type.
 *
 * An image is shown inline, an audio part plays in the `Audio` bar and a video
 * part in the `Video` player, and anything else is an attachment row. The part
 * is data in and events out: open and download are ordinary links, and the app
 * owns the file.
 */
function FilePart({ part, labels, className, ...props }: FilePartProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const url = part.url?.trim() ?? '';
  const href = useOpenableUrl(url);
  const kind = mediaKindOf(part.mediaType ?? '');
  const name = nameOf(part, text);
  const openLabel = actionLabelOf(text.open, name);
  const downloadLabel = actionLabelOf(text.download, name);

  // A part that arrived without data has nothing to show and nothing to open;
  // it still gets a name, so the gap reads as a missing file rather than a
  // blank space in the message. The attachment branches keep the primitive's
  // own `data-slot` and are marked for the family with `data-file-part`.
  if (!url) {
    return (
      <Attachment
        data-file-part=""
        data-media-type={kind}
        state="idle"
        className={className}
        // Forwarded props are the figure's; the attachment's root is a div, so
        // the element type is widened at this one boundary.
        {...(props as React.ComponentProps<typeof Attachment>)}
      >
        <AttachmentMedia>
          <FileIcon aria-hidden="true" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{name}</AttachmentTitle>
          <AttachmentDescription>{text.missing}</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    );
  }

  if (kind === 'image') {
    return (
      <figure
        data-slot="file-part"
        data-media-type="image"
        className={cn('flex max-w-full min-w-0 flex-col gap-2', className)}
        {...props}
      >
        <img
          data-slot="file-part-image"
          src={href}
          alt={name}
          className="max-h-96 max-w-full self-start rounded-sm border border-input object-contain"
        />
        <figcaption className="flex min-w-0 items-center gap-2">
          <span
            data-slot="file-part-name"
            className="min-w-0 truncate text-sm text-muted-foreground"
          >
            {name}
          </span>
          <FileActions
            href={href}
            name={name}
            openLabel={openLabel}
            downloadLabel={downloadLabel}
          />
        </figcaption>
      </figure>
    );
  }

  if (kind === 'audio' || kind === 'video') {
    return (
      <figure
        data-slot="file-part"
        data-media-type={kind}
        className={cn('flex max-w-full min-w-0 flex-col gap-2', className)}
        {...props}
      >
        {kind === 'video' ? (
          <Video title={name} renditions={[{ src: href, height: NO_RENDITION_HEIGHT }]} />
        ) : (
          <Audio
            title={name}
            src={href}
            labels={{
              play: actionLabelOf(text.play, name),
              pause: actionLabelOf(text.pause, name),
              seek: actionLabelOf(text.seek, name),
              mute: actionLabelOf(text.mute, name),
              unmute: actionLabelOf(text.unmute, name),
            }}
          />
        )}
        <figcaption
          data-slot="file-part-name"
          className="min-w-0 truncate text-sm text-muted-foreground"
        >
          {name}
        </figcaption>
      </figure>
    );
  }

  return (
    <Attachment
      data-file-part=""
      data-media-type={kind}
      className={className}
      {...(props as React.ComponentProps<typeof Attachment>)}
    >
      <AttachmentMedia>
        <FileIcon aria-hidden="true" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{name}</AttachmentTitle>
        <AttachmentDescription>{part.mediaType || text.file}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction asChild>
          <a href={href} target="_blank" rel="noreferrer noopener" aria-label={openLabel}>
            <ExternalLinkIcon aria-hidden="true" />
          </a>
        </AttachmentAction>
        <AttachmentAction asChild>
          <a href={href} download={name} aria-label={downloadLabel}>
            <DownloadIcon aria-hidden="true" />
          </a>
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
}

export { FilePart };
