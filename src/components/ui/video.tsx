'use client';

import {
  CaptionsButton,
  Container,
  Controls,
  FullscreenButton,
  Gesture,
  Hotkey,
  Menu,
  MuteButton,
  PiPButton,
  PlayButton,
  Poster,
  Time,
  TimeSlider,
  VolumePopover,
  VolumeSlider,
  useCaptionsOptions,
  useCreateTextTrack,
  usePlaybackRateOptions,
} from '@videojs/react';
import { Video as VideoElement, VideoPlayer, usePlayer } from '@videojs/react/video';
import { cn } from 'cn';
import {
  CaptionsIcon,
  CaptionsOffIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MaximizeIcon,
  MinimizeIcon,
  PauseIcon,
  PictureInPicture2Icon,
  PlayIcon,
  Settings2Icon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react';
import * as React from 'react';

import {
  AUTO_QUALITY,
  chapterCues,
  findChapterAtTime,
  formatWatchTime,
  qualityOptions,
  raiseDefaultCaptionLine,
  resolveRendition,
  type QualityOption,
  type VideoCaptionTrack,
  type VideoChapter,
  type VideoEnvironment,
  type VideoRendition,
} from '../../lib/video';
import { Button } from './button';

export interface VideoProps {
  /** The player's accessible name. */
  title: string;
  /** Every encoded file of the video; Auto picks one from the environment. */
  renditions: readonly VideoRendition[];
  poster?: string;
  chapters?: readonly VideoChapter[];
  captionTrack?: VideoCaptionTrack;
  className?: string;
}

/**
 * A 16:9 video player on Video.js 10, with a control bar built from the design
 * tokens. Deep-import it; no Video.js stylesheet is needed.
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
  const captionTrackRef = React.useRef<HTMLTrackElement>(null);
  const pendingPlaybackRef = React.useRef<PendingPlayback | null>(null);

  const options = React.useMemo(() => qualityOptions(renditions), [renditions]);
  const activeRendition = React.useMemo(
    () => resolveRendition(renditions, quality, environment),
    [renditions, quality, environment],
  );

  useRestoredPlayhead(videoRef, activeRendition?.src ?? null, pendingPlaybackRef);
  useRaisedCaptions(captionTrackRef, captionTrack?.src ?? null);

  if (!activeRendition) return null;

  const selectQuality = (value: string) => {
    if (value === quality) return;

    const element = videoRef.current;
    pendingPlaybackRef.current = {
      position: element?.currentTime ?? 0,
      wasPlaying: element ? !element.paused : false,
    };
    setQuality(value);
  };

  const seekTo = (startTime: number) => {
    const element = videoRef.current;
    if (element) element.currentTime = startTime;
  };

  return (
    <div data-slot="video" className={cn('flex w-full min-w-0 flex-col gap-1.5', className)}>
      <VideoPlayer title={title} poster={poster}>
        <Container className="relative aspect-video w-full overflow-hidden rounded-sm border border-border bg-black">
          <VideoElement
            ref={videoRef}
            aria-label={title}
            src={activeRendition.src}
            poster={poster}
            playsInline
            preload={environment === UNKNOWN_ENVIRONMENT ? 'none' : 'metadata'}
            className="absolute inset-0 size-full object-contain"
          >
            {captionTrack ? (
              <track
                ref={captionTrackRef}
                kind="captions"
                src={captionTrack.src}
                label={captionTrack.label}
                srcLang={captionTrack.language}
                default={captionTrack.default ?? true}
              />
            ) : null}
          </VideoElement>
          <Poster.Root className="pointer-events-none absolute inset-0 transition-opacity not-data-visible:opacity-0 [&_img]:size-full [&_img]:object-cover">
            <Poster.Image />
          </Poster.Root>
          <VideoControls options={options} quality={quality} onQualityChange={selectQuality} />
          <VideoBehaviors />
        </Container>
        <ChapterTrack chapters={chapters} />
        <ChapterList chapters={chapters} onSeek={seekTo} />
      </VideoPlayer>
    </div>
  );
}

/** The control bar, and the settings menu the quality choice lives in. */
function VideoControls({
  options,
  quality,
  onQualityChange,
}: {
  options: QualityOption[];
  quality: string;
  onQualityChange: (quality: string) => void;
}) {
  return (
    <Controls.Root>
      <Controls.Backdrop className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-200 not-data-visible:opacity-0" />
      <Controls.Content className="absolute inset-x-2 bottom-2 z-20 flex flex-col gap-1 rounded-sm border border-border bg-popover/70 p-1 text-popover-foreground backdrop-blur transition-[opacity,translate] duration-200 not-data-visible:pointer-events-none not-data-visible:invisible not-data-visible:translate-y-1 not-data-visible:opacity-0">
        <TimeSlider.Root className="group/slider relative flex h-4 w-full cursor-pointer items-center">
          <TimeSlider.Chapters className="absolute inset-0" renderChapter={renderChapter} />
          <TimeSlider.Thumb className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ring bg-white opacity-0 transition-opacity group-focus-visible/slider:opacity-100" />
          <TimeSlider.Preview className="pointer-events-none absolute bottom-full mb-2 hidden rounded-sm border border-border bg-popover px-2 py-1 text-xs whitespace-nowrap group-data-interactive/slider:block">
            <TimeSlider.ChapterTitle className="block font-medium" />
            <TimeSlider.Value type="pointer" className="block text-muted-foreground tabular-nums" />
          </TimeSlider.Preview>
        </TimeSlider.Root>

        <div className="flex items-center gap-0.5">
          <PlayButton
            render={(props, state) => (
              <Button {...props} variant="ghost" size="icon-sm">
                {state.paused ? <PlayIcon /> : <PauseIcon />}
              </Button>
            )}
          />
          <VolumeControl />
          <Time.Group className="flex items-center gap-1 px-1 text-xs text-muted-foreground tabular-nums">
            <Time.Value type="current" />
            <Time.Separator />
            <Time.Value type="duration" />
          </Time.Group>
          <span className="flex-1" />
          <CaptionsButton
            render={(props, state) => (
              <Button {...props} variant="ghost" size="icon-sm">
                {state.subtitlesShowing ? <CaptionsIcon /> : <CaptionsOffIcon />}
              </Button>
            )}
          />
          <VideoSettingsMenu
            options={options}
            quality={quality}
            onQualityChange={onQualityChange}
          />
          <PiPButton
            render={(props) => (
              <Button {...props} variant="ghost" size="icon-sm">
                <PictureInPicture2Icon />
              </Button>
            )}
          />
          <FullscreenButton
            render={(props, state) => (
              <Button {...props} variant="ghost" size="icon-sm">
                {state.fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
              </Button>
            )}
          />
        </div>
      </Controls.Content>
    </Controls.Root>
  );
}

/** One chapter segment on the timeline, filled up to the playhead. */
function renderChapter(
  props: Omit<React.HTMLProps<HTMLElement>, 'ref'>,
  chapter: { startPercent: string; width?: string; height?: string },
) {
  return (
    <div
      {...props}
      data-slot="video-chapter"
      className="absolute inset-y-0 flex items-center px-px"
      style={{ ...props.style, left: chapter.startPercent, width: chapter.width ?? chapter.height }}
    >
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: 'var(--media-slider-chapter-fill)' }}
        />
      </div>
    </div>
  );
}

/** Mute, and a vertical volume slider when the media has a volume level. */
function VolumeControl() {
  return (
    <VolumePopover.Root openOnHover side="top" delay={100} closeDelay={250}>
      <VolumePopover.Trigger
        render={
          <MuteButton
            render={(props, state) => (
              <Button {...props} variant="ghost" size="icon-sm">
                <VolumeIcon level={state.volumeLevel} />
              </Button>
            )}
          />
        }
      />
      <VolumePopover.Popup className="flex h-28 w-9 items-center justify-center rounded-sm border border-border bg-popover p-2 pb-4">
        <VolumeSlider.Root orientation="vertical" className="relative h-full w-1 cursor-pointer">
          <VolumeSlider.Track className="absolute inset-0 rounded-full bg-muted" />
          <VolumeSlider.Fill
            className="absolute inset-x-0 bottom-0 rounded-full bg-primary"
            style={{ height: 'var(--media-slider-fill)' }}
          />
          <VolumeSlider.Thumb
            className="absolute left-1/2 size-3 -translate-x-1/2 translate-y-1/2 rounded-full border border-ring bg-white"
            style={{ bottom: 'var(--media-slider-fill)' }}
          />
        </VolumeSlider.Root>
      </VolumePopover.Popup>
    </VolumePopover.Root>
  );
}

function VolumeIcon({ level }: { level: MuteButton.State['volumeLevel'] }) {
  if (level === 'off') return <VolumeXIcon />;
  if (level === 'high') return <Volume2Icon />;

  return <Volume1Icon />;
}

/**
 * The gear in the control bar. Quality, speed and the caption language are
 * submenus, so the bar keeps one settings button rather than three controls.
 */
function VideoSettingsMenu({
  options,
  quality,
  onQualityChange,
}: {
  options: QualityOption[];
  quality: string;
  onQualityChange: (quality: string) => void;
}) {
  const playbackRate = usePlaybackRateOptions();
  const captions = useCaptionsOptions();
  const [open, setOpen] = React.useState(false);

  const speed = playbackRate?.hidden === false ? playbackRate : null;
  const captionChoice = captions?.hidden === false ? captions : null;
  const currentQualityLabel = quality === AUTO_QUALITY ? 'Auto' : `${quality}p`;

  if (options.length === 0 && !speed && !captionChoice) return null;

  const pick = (apply: () => void) => {
    apply();
    setOpen(false);
  };

  return (
    <Menu.Root side="top" align="end" open={open} onOpenChange={setOpen}>
      <Menu.Trigger render={<Button variant="ghost" size="icon-sm" />} aria-label="Settings">
        <Settings2Icon />
      </Menu.Trigger>
      <Menu.Popup className="z-30 w-44 rounded-sm border border-border bg-popover p-1 text-popover-foreground">
        <Menu.Content aria-label="Settings" className="flex flex-col">
          {options.length > 0 ? (
            <SettingsSubmenu label="Quality" value={currentQualityLabel}>
              <SettingsRadioGroup
                label="Quality"
                value={quality}
                onValueChange={(value) => pick(() => onQualityChange(value))}
                options={options}
              />
            </SettingsSubmenu>
          ) : null}
          {speed ? (
            <SettingsSubmenu label="Speed" value={speed.selectedLabel}>
              <SettingsRadioGroup
                label="Playback rate"
                value={speed.value}
                onValueChange={(value) => pick(() => speed.setValue(value))}
                options={speed.options}
              />
            </SettingsSubmenu>
          ) : null}
          {captionChoice ? (
            <SettingsSubmenu label="Captions" value={captionChoice.selectedLabel}>
              <SettingsRadioGroup
                label="Captions"
                value={captionChoice.value}
                onValueChange={(value) => pick(() => captionChoice.setValue(value))}
                options={captionChoice.options}
              />
            </SettingsSubmenu>
          ) : null}
        </Menu.Content>
      </Menu.Popup>
    </Menu.Root>
  );
}

/** A settings row that opens a submenu, labelled with its current value. */
function SettingsSubmenu({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger className={MENU_ITEM_CLASS}>
        <span className="flex-1">{label}</span>
        <span className="text-xs text-muted-foreground">{value}</span>
        <ChevronRightIcon className="size-4 text-muted-foreground" />
      </Menu.Trigger>
      <Menu.Content className="absolute inset-0 z-10 overflow-y-auto rounded-sm bg-popover p-1 aria-hidden:hidden">
        <Menu.Item className={MENU_ITEM_CLASS}>
          <ChevronLeftIcon className="size-4" />
          {label}
        </Menu.Item>
        <Menu.Separator className="my-1 h-px bg-border" />
        {children}
      </Menu.Content>
    </Menu.Root>
  );
}

/** The radio items of one settings submenu, checked on the right like `dropdown-menu`. */
function SettingsRadioGroup({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <Menu.RadioGroup
      className="flex flex-col"
      value={value}
      onValueChange={onValueChange}
      aria-label={label}
    >
      {options.map((option) => (
        <Menu.RadioItem
          key={option.value}
          value={option.value}
          className={cn(MENU_ITEM_CLASS, 'pr-8')}
        >
          {option.label}
          <Menu.ItemIndicator
            checked={value === option.value}
            className="pointer-events-none absolute right-2 flex items-center justify-center"
          >
            <CheckIcon className="size-4" />
          </Menu.ItemIndicator>
        </Menu.RadioItem>
      ))}
    </Menu.RadioGroup>
  );
}

const MENU_ITEM_CLASS =
  'relative flex cursor-pointer items-center gap-1.5 rounded-sm px-1.5 py-1 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4';

/** Registers the chapter list as the player's chapters track, which the timeline draws. */
function ChapterTrack({ chapters }: { chapters?: readonly VideoChapter[] }) {
  const track = React.useMemo(
    () => ({ kind: 'chapters' as const, label: 'Chapters', cues: chapterCues(chapters ?? []) }),
    [chapters],
  );

  useCreateTextTrack(track);

  return null;
}

/** The chapter list under the player: the current chapter marked, any entry seeks. */
function ChapterList({
  chapters,
  onSeek,
}: {
  chapters?: readonly VideoChapter[];
  onSeek: (startTime: number) => void;
}) {
  const currentTime = usePlayer((state) => state.currentTime);
  const currentChapter = findChapterAtTime(chapters ?? [], currentTime);

  if (!chapters || chapters.length === 0) return null;

  return (
    <ol aria-label="Chapters" data-slot="video-chapters" className="flex flex-wrap gap-1.5">
      {chapters.map((chapter) => (
        <li key={`${chapter.startTime}-${chapter.title}`}>
          <button
            type="button"
            aria-current={chapter === currentChapter ? 'true' : undefined}
            className="flex items-baseline gap-1.5 rounded-sm border border-border px-2 py-1 font-sans text-xs text-muted-foreground focus-ring transition-colors hover:text-foreground aria-[current=true]:border-primary aria-[current=true]:text-foreground"
            onClick={() => onSeek(chapter.startTime)}
          >
            <span className="tabular-nums">{formatWatchTime(chapter.startTime)}</span>
            {chapter.title}
          </button>
        </li>
      ))}
    </ol>
  );
}

/** Play on a tap, seek on a double tap, and the shortcuts a video player owes a keyboard. */
function VideoBehaviors() {
  return (
    <>
      <Gesture type="tap" action="togglePaused" pointer="mouse" region="center" />
      <Gesture type="tap" action="toggleControls" pointer="touch" />
      <Gesture type="doubletap" action="seekStep" region="left" />
      <Gesture type="doubletap" action="toggleFullscreen" region="center" />
      <Gesture type="doubletap" action="seekStep" region="right" />
      <Hotkey keys="Space" action="togglePaused" />
      <Hotkey keys="k" action="togglePaused" />
      <Hotkey keys="m" action="toggleMuted" />
      <Hotkey keys="f" action="toggleFullscreen" />
      <Hotkey keys="c" action="toggleSubtitles" />
      <Hotkey keys="ArrowLeft" action="seekStep" />
      <Hotkey keys="ArrowRight" action="seekStep" />
    </>
  );
}

interface PendingPlayback {
  position: number;
  wasPlaying: boolean;
}

/** Lifts the browser-drawn captions clear of the player's bottom edge. */
function useRaisedCaptions(
  trackRef: React.RefObject<HTMLTrackElement | null>,
  source: string | null,
) {
  React.useEffect(() => {
    const element = trackRef.current;
    if (!element || !source) return;

    const raise = () => raiseDefaultCaptionLine(element.track?.cues ?? []);

    raise();
    element.addEventListener('load', raise);

    return () => element.removeEventListener('load', raise);
  }, [trackRef, source]);
}

/** Puts the playhead back, and resumes playback, once a new source has metadata. */
function useRestoredPlayhead(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  activeSource: string | null,
  pendingPlaybackRef: React.RefObject<PendingPlayback | null>,
) {
  React.useEffect(() => {
    const element = videoRef.current;
    const saved = pendingPlaybackRef.current;

    if (!saved || !element || !activeSource) return;

    pendingPlaybackRef.current = null;

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
  }, [activeSource, pendingPlaybackRef, videoRef]);
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
