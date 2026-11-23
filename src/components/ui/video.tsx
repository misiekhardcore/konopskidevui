'use client';

import { useCreateTextTrack } from '@videojs/react';
import { Video as VideoElement, VideoPlayer, VideoSkin, usePlayer } from '@videojs/react/video';
import { cn } from 'cn';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import {
  AUTO_QUALITY,
  chapterCues,
  findChapterAtTime,
  qualityOptions,
  resolveRendition,
  type QualityOption,
  type VideoCaptionTrack,
  type VideoChapter,
  type VideoEnvironment,
  type VideoRendition,
} from '../../lib/video';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

export interface VideoProps {
  /** The player's accessible name, and the title the skin shows. */
  title: string;
  /** Every encoded file of the video; Auto picks one from the environment. */
  renditions: readonly VideoRendition[];
  poster?: string;
  chapters?: readonly VideoChapter[];
  captionTrack?: VideoCaptionTrack;
  className?: string;
}

/**
 * A 16:9 video player on Video.js 10, styled by the design tokens. Deep-import
 * it, and load `@videojs/react/video/skin.css` once alongside it.
 */
function Video({ title, renditions, poster, chapters, captionTrack, className }: VideoProps) {
  // Client-only by design: the server renders `UNKNOWN_ENVIRONMENT`, and the
  // player picks its rendition once the browser can report the screen.
  const environment = React.useSyncExternalStore(
    NO_SUBSCRIPTION,
    readEnvironment,
    () => UNKNOWN_ENVIRONMENT,
  );
  const [quality, setQuality] = React.useState<string>(AUTO_QUALITY);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const options = React.useMemo(() => qualityOptions(renditions), [renditions]);
  const activeRendition = React.useMemo(
    () => resolveRendition(renditions, quality, environment),
    [renditions, quality, environment],
  );

  if (!activeRendition) return null;

  return (
    <div data-slot="video" className={cn('flex w-full min-w-0 flex-col gap-1.5', className)}>
      <VideoPlayer title={title} poster={poster}>
        <VideoSkin className="aspect-video w-full overflow-hidden rounded-sm border border-border bg-black">
          <VideoElement
            ref={videoRef}
            aria-label={title}
            src={activeRendition.src}
            poster={poster}
            playsInline
            preload={environment === UNKNOWN_ENVIRONMENT ? 'none' : 'metadata'}
          >
            {captionTrack ? (
              <track
                kind="captions"
                src={captionTrack.src}
                label={captionTrack.label}
                srcLang={captionTrack.language}
                default={captionTrack.default ?? true}
              />
            ) : null}
          </VideoElement>
        </VideoSkin>
        <ChapterTrack chapters={chapters} />
        <VideoFooter
          videoRef={videoRef}
          chapterList={chapters}
          options={options}
          quality={quality}
          activeSource={activeRendition.src}
          onQualityChange={setQuality}
        />
      </VideoPlayer>
    </div>
  );
}

/** Registers the chapter list as the player's chapters track, which the skin draws. */
function ChapterTrack({ chapters }: { chapters?: readonly VideoChapter[] }) {
  const track = React.useMemo(
    () => ({ kind: 'chapters' as const, label: 'Chapters', cues: chapterCues(chapters ?? []) }),
    [chapters],
  );

  useCreateTextTrack(track);

  return null;
}

/** The chapter under the playhead, and the quality menu when there is a choice. */
function VideoFooter({
  videoRef,
  chapterList,
  options,
  quality,
  activeSource,
  onQualityChange,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  chapterList?: readonly VideoChapter[];
  options: QualityOption[];
  quality: string;
  activeSource: string;
  onQualityChange: (quality: string) => void;
}) {
  const currentTime = usePlayer((state) => state.currentTime);
  const chapter = findChapterAtTime(chapterList ?? [], currentTime);
  const pendingPlayback = React.useRef<{ position: number; wasPlaying: boolean } | null>(null);

  React.useEffect(() => {
    const element = videoRef.current;
    const saved = pendingPlayback.current;
    if (!saved || !element) return;

    pendingPlayback.current = null;

    const restore = () => {
      element.currentTime = saved.position;
      if (saved.wasPlaying) void element.play();
    };

    if (element.readyState >= HTMLMediaElement.HAVE_METADATA) {
      restore();
      return;
    }

    element.addEventListener('loadedmetadata', restore, { once: true });
    return () => element.removeEventListener('loadedmetadata', restore);
  }, [activeSource, videoRef]);

  if (!chapter && options.length === 0) return null;

  const selectQuality = (value: string) => {
    if (value === quality) return;

    const element = videoRef.current;
    pendingPlayback.current = {
      position: element?.currentTime ?? 0,
      wasPlaying: element ? !element.paused : false,
    };
    onQualityChange(value);
  };

  return (
    <div
      data-slot="video-footer"
      className="flex min-h-8 min-w-0 items-center justify-between gap-3"
    >
      <p className="min-w-0 truncate text-xs text-muted-foreground">{chapter?.title}</p>
      {options.length > 0 ? (
        <QualityMenu options={options} quality={quality} onQualityChange={selectQuality} />
      ) : null}
    </div>
  );
}

function QualityMenu({
  options,
  quality,
  onQualityChange,
}: {
  options: QualityOption[];
  quality: string;
  onQualityChange: (quality: string) => void;
}) {
  const currentLabel = quality === AUTO_QUALITY ? 'Auto' : `${quality}p`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Quality: ${currentLabel}`}
          className="shrink-0"
        >
          {currentLabel}
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={quality} onValueChange={onQualityChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** What Auto assumes before the client has read the screen and the connection. */
const UNKNOWN_ENVIRONMENT: VideoEnvironment = {
  viewportWidth: Number.POSITIVE_INFINITY,
  saveData: false,
  effectiveConnectionType: null,
};

const NO_SUBSCRIPTION = () => () => {};

/** The last snapshot, by value, because `useSyncExternalStore` compares identity. */
let cachedEnvironment: VideoEnvironment | null = null;

function readEnvironment(): VideoEnvironment {
  if (typeof window === 'undefined') return UNKNOWN_ENVIRONMENT;

  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  const viewportWidth = window.innerWidth;
  const saveData = connection?.saveData === true;
  const effectiveConnectionType = connection?.effectiveType ?? null;

  if (
    cachedEnvironment?.viewportWidth === viewportWidth &&
    cachedEnvironment.saveData === saveData &&
    cachedEnvironment.effectiveConnectionType === effectiveConnectionType
  ) {
    return cachedEnvironment;
  }

  cachedEnvironment = { viewportWidth, saveData, effectiveConnectionType };
  return cachedEnvironment;
}

export { Video };
export type { VideoCaptionTrack, VideoChapter, VideoRendition };
