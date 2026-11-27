'use client';

import { cn } from 'cn';
import { PauseIcon, PlayIcon, Volume2Icon, VolumeXIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from './button';
import { Slider } from './slider';

/** Every control's accessible name; each one defaults to a verb and the title. */
export interface AudioLabels {
  play: string;
  pause: string;
  seek: string;
  mute: string;
  unmute: string;
}

export interface AudioProps {
  /** The player's accessible name, and the file's name inside each control. */
  title: string;
  /** The file to play. */
  src: string;
  /** Override any control's accessible name, for a translated app. */
  labels?: Partial<AudioLabels>;
  className?: string;
}

/** Seconds as `m:ss`, so the clock keeps one width while it counts. */
function clockOf(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * A single audio file with a control bar drawn from the design tokens: play and
 * pause, a seek slider, the clock and mute, every one of them keyboard operable.
 * The native `<audio>` element still does the playing; only its chrome is ours,
 * so the bar matches the video player instead of the browser's own widget.
 */
function Audio({ title, src, labels, className }: AudioProps) {
  const media = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  const text: AudioLabels = {
    play: `Play ${title}`,
    pause: `Pause ${title}`,
    seek: `Seek ${title}`,
    mute: `Mute ${title}`,
    unmute: `Unmute ${title}`,
    ...labels,
  };

  const togglePlayback = () => {
    const element = media.current;

    if (!element) return;

    if (!element.paused) {
      element.pause();

      return;
    }

    // A browser that blocks playback rejects here; the reader can press play
    // again, and jsdom's `play` answers with nothing at all.
    const playback: Promise<void> | undefined = element.play();

    playback?.catch(() => {});
  };

  const seek = ([seconds]: number[]) => {
    const element = media.current;

    if (!element) return;

    element.currentTime = seconds ?? 0;
    setPosition(element.currentTime);
  };

  const toggleMuted = () => {
    const element = media.current;

    if (!element) return;

    element.muted = !element.muted;
    setMuted(element.muted);
  };

  return (
    <div
      data-slot="audio"
      className={cn(
        'flex w-full max-w-md items-center gap-1 rounded-sm border border-border bg-popover/70 p-1 text-popover-foreground backdrop-blur',
        className,
      )}
    >
      <audio
        ref={media}
        data-slot="audio-media"
        src={src}
        preload="metadata"
        aria-label={title}
        className="sr-only"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setPosition(0);
        }}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
      />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={playing ? text.pause : text.play}
        onClick={togglePlayback}
      >
        {playing ? <PauseIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}
      </Button>
      {/* The slider's own track is the same muted tone as the bar, so the
          scrubber would read as a floating thumb; the border token is the track
          colour a surface of this tone needs. */}
      <Slider
        aria-label={text.seek}
        min={0}
        max={duration || 1}
        value={[Math.min(position, duration || 1)]}
        onValueChange={seek}
        disabled={duration === 0}
        className="flex-1 [&_[data-slot=slider-track]]:bg-border"
      />
      <span data-slot="audio-clock" className="px-1 text-xs text-muted-foreground tabular-nums">
        {clockOf(position)} / {clockOf(duration)}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={muted ? text.unmute : text.mute}
        onClick={toggleMuted}
      >
        {muted ? <VolumeXIcon aria-hidden="true" /> : <Volume2Icon aria-hidden="true" />}
      </Button>
    </div>
  );
}

export { Audio };
