/**
 * The rules a video player follows, independent of any player library: which
 * rendition Auto starts on, how a chapter list becomes cues, and how a watch
 * time is written.
 */

/** The quality value that leaves the choice to the environment. */
export const AUTO_QUALITY = 'auto';

/** Below this width a viewport counts as a phone, where 1080p is wasted bytes. */
const SMALL_VIEWPORT = 768;

/** Effective connection types a browser reports for a slow link. */
const SLOW_CONNECTIONS = new Set(['slow-2g', '2g', '3g']);

/** One encoded file of a video, with the height that names its quality. */
export interface VideoRendition {
  src: string;
  height: number;
}

/** A named time range inside a video, as the content toolkit writes it. */
export interface VideoChapter {
  startTime: number;
  title: string;
}

/** A WebVTT caption track a reader can turn on. */
export interface VideoCaptionTrack {
  src: string;
  label: string;
  language: string;
  default?: boolean;
}

/** What the browser tells us about the reader's screen and connection. */
export interface VideoEnvironment {
  viewportWidth: number;
  saveData: boolean;
  effectiveConnectionType: string | null;
}

/** One entry in the quality menu. */
export interface QualityOption {
  value: string;
  label: string;
}

/** A chapter as the player's chapters text track takes it. */
export interface ChapterCue {
  id: string;
  startTime: number;
  endTime?: number;
  text: string;
}

/** `65` → `1:05`, `3725` → `1:02:05`. */
export function formatWatchTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';

  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const remainder = whole % 60;

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(remainder)}` : `${minutes}:${pad(remainder)}`;
}

/**
 * Auto followed by every distinct height, highest first. A video with one
 * rendition has no choice to offer, so it gets no menu.
 */
export function qualityOptions(renditions: readonly VideoRendition[]): QualityOption[] {
  const heights = distinctHeights(renditions);

  if (heights.length < 2) return [];

  return [
    { value: AUTO_QUALITY, label: 'Auto' },
    ...heights.map((height) => ({ value: String(height), label: `${height}p` })),
  ];
}

/** Whether Auto should start on the smallest file rather than the largest. */
export function prefersSmallRendition(environment: VideoEnvironment): boolean {
  return (
    environment.viewportWidth < SMALL_VIEWPORT ||
    environment.saveData ||
    SLOW_CONNECTIONS.has(environment.effectiveConnectionType ?? '')
  );
}

/** The rendition Auto picks: the lowest when constrained, the highest otherwise. */
export function chooseAutomaticRendition(
  renditions: readonly VideoRendition[],
  environment: VideoEnvironment,
): VideoRendition | null {
  if (renditions.length === 0) return null;

  const byHeight = [...renditions].sort((first, second) => second.height - first.height);

  return prefersSmallRendition(environment) ? byHeight[byHeight.length - 1] : byHeight[0];
}

/**
 * The rendition a quality selection plays. A height the list does not carry
 * falls back to Auto rather than leaving the player without a source.
 */
export function resolveRendition(
  renditions: readonly VideoRendition[],
  quality: string,
  environment: VideoEnvironment,
): VideoRendition | null {
  if (quality !== AUTO_QUALITY) {
    const chosen = renditions.find((rendition) => String(rendition.height) === quality);

    if (chosen) return chosen;
  }

  return chooseAutomaticRendition(renditions, environment);
}

/**
 * Chapters ordered by start, each running to the next one. Unusable entries and
 * repeated start times are dropped: a text track cannot hold two cues that
 * begin together.
 */
export function chapterCues(chapters: readonly VideoChapter[]): ChapterCue[] {
  const ordered = chapters
    .filter((chapter) => Number.isFinite(chapter.startTime) && chapter.startTime >= 0)
    .sort((first, second) => first.startTime - second.startTime);

  return ordered
    .filter((chapter, index) => index === 0 || chapter.startTime !== ordered[index - 1].startTime)
    .map((chapter, index, kept) => ({
      id: `chapter-${index}`,
      startTime: chapter.startTime,
      ...(kept[index + 1] ? { endTime: kept[index + 1].startTime } : {}),
      text: chapter.title,
    }));
}

/** The chapter covering a playback position, or null before the first one. */
export function findChapterAtTime(
  chapters: readonly VideoChapter[],
  time: number,
): VideoChapter | null {
  const covering = chapters
    .filter((chapter) => Number.isFinite(chapter.startTime) && chapter.startTime <= time)
    .sort((first, second) => second.startTime - first.startTime);

  return covering[0] ?? null;
}

/** Heights present in the list, highest first, without duplicates. */
function distinctHeights(renditions: readonly VideoRendition[]): number[] {
  return [...new Set(renditions.map((rendition) => rendition.height))].sort(
    (first, second) => second - first,
  );
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
