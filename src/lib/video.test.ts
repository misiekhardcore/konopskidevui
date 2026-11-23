import { describe, expect, it } from 'vitest';

import {
  AUTO_QUALITY,
  chapterCues,
  chooseAutomaticRendition,
  findChapterAtTime,
  formatWatchTime,
  prefersSmallRendition,
  qualityOptions,
  raiseDefaultCaptionLine,
  resolveRendition,
} from './video';

const desktop = { viewportWidth: 1440, saveData: false, effectiveConnectionType: '4g' };

const renditions = [
  { src: '/video-1080.mp4', height: 1080 },
  { src: '/video-720.mp4', height: 720 },
];

describe('formatWatchTime', () => {
  it('formats a duration under an hour as minutes and seconds', () => {
    expect(formatWatchTime(0)).toBe('0:00');
    expect(formatWatchTime(65)).toBe('1:05');
    expect(formatWatchTime(651)).toBe('10:51');
  });

  it('formats an hour or more with an hours part', () => {
    expect(formatWatchTime(3600)).toBe('1:00:00');
    expect(formatWatchTime(3725)).toBe('1:02:05');
  });

  it('clamps values that are not a usable duration', () => {
    expect(formatWatchTime(-5)).toBe('0:00');
    expect(formatWatchTime(Number.NaN)).toBe('0:00');
    expect(formatWatchTime(Number.POSITIVE_INFINITY)).toBe('0:00');
  });
});

describe('qualityOptions', () => {
  it('offers Auto and every rendition, highest first', () => {
    expect(qualityOptions(renditions)).toEqual([
      { value: AUTO_QUALITY, label: 'Auto' },
      { value: '1080', label: '1080p' },
      { value: '720', label: '720p' },
    ]);
  });

  it('collapses two files of the same height into one choice', () => {
    expect(
      qualityOptions([
        { src: '/a.mp4', height: 720 },
        { src: '/b.mp4', height: 720 },
      ]),
    ).toEqual([]);
  });

  it('offers no menu for a single rendition', () => {
    expect(qualityOptions([{ src: '/only.mp4', height: 720 }])).toEqual([]);
  });
});

describe('prefersSmallRendition', () => {
  it('prefers the small file on a narrow viewport', () => {
    expect(prefersSmallRendition({ ...desktop, viewportWidth: 390 })).toBe(true);
  });

  it('prefers the small file when save-data is on', () => {
    expect(prefersSmallRendition({ ...desktop, saveData: true })).toBe(true);
  });

  it.each(['slow-2g', '2g', '3g'])('prefers the small file on %s', (type) => {
    expect(prefersSmallRendition({ ...desktop, effectiveConnectionType: type })).toBe(true);
  });

  it('prefers the large file on a wide, fast, unmetered connection', () => {
    expect(prefersSmallRendition(desktop)).toBe(false);
    expect(prefersSmallRendition({ ...desktop, effectiveConnectionType: null })).toBe(false);
  });
});

describe('chooseAutomaticRendition', () => {
  it('chooses the lowest rendition when the environment is constrained', () => {
    expect(chooseAutomaticRendition(renditions, { ...desktop, saveData: true })?.src).toBe(
      '/video-720.mp4',
    );
  });

  it('chooses the highest rendition otherwise', () => {
    expect(chooseAutomaticRendition(renditions, desktop)?.src).toBe('/video-1080.mp4');
  });

  it('has nothing to choose without renditions', () => {
    expect(chooseAutomaticRendition([], desktop)).toBeNull();
  });
});

describe('resolveRendition', () => {
  it('resolves Auto through the environment', () => {
    expect(resolveRendition(renditions, AUTO_QUALITY, desktop)?.src).toBe('/video-1080.mp4');
  });

  it('resolves a chosen height to its file', () => {
    expect(resolveRendition(renditions, '720', desktop)?.src).toBe('/video-720.mp4');
  });

  it('falls back to the automatic choice for a height it does not carry', () => {
    expect(resolveRendition(renditions, '480', desktop)?.src).toBe('/video-1080.mp4');
  });

  it('keeps the automatic choice when a rendition list becomes single', () => {
    expect(resolveRendition(renditions.slice(1), AUTO_QUALITY, desktop)?.src).toBe(
      '/video-720.mp4',
    );
  });
});

describe('chapterCues', () => {
  it('orders chapters by start time and runs each to the next', () => {
    expect(
      chapterCues([
        { startTime: 30, title: 'Installing' },
        { startTime: 0, title: 'Introduction' },
        { startTime: 90, title: 'Theming' },
      ]),
    ).toEqual([
      { id: 'chapter-0', startTime: 0, endTime: 30, text: 'Introduction' },
      { id: 'chapter-1', startTime: 30, endTime: 90, text: 'Installing' },
      { id: 'chapter-2', startTime: 90, text: 'Theming' },
    ]);
  });

  it('drops unusable chapters and duplicate start times', () => {
    expect(
      chapterCues([
        { startTime: Number.NaN, title: 'Broken' },
        { startTime: -10, title: 'Before the start' },
        { startTime: 5, title: 'Kept' },
        { startTime: 5, title: 'Duplicate' },
      ]),
    ).toEqual([{ id: 'chapter-0', startTime: 5, text: 'Kept' }]);
  });

  it('has no cues without chapters', () => {
    expect(chapterCues([])).toEqual([]);
  });
});

describe('raiseDefaultCaptionLine', () => {
  function cue(line: number | 'auto') {
    return { line, lineAlign: 'start', snapToLines: true } as unknown as VTTCue;
  }

  it('lifts captions the author left unpositioned, anchored by their bottom edge', () => {
    const cues = [cue('auto'), cue('auto')];

    raiseDefaultCaptionLine(cues);

    expect(cues.map((entry) => entry.line)).toEqual([88, 88]);
    expect(cues.map((entry) => entry.snapToLines)).toEqual([false, false]);
    expect(cues.map((entry) => entry.lineAlign)).toEqual(['end', 'end']);
  });

  it('leaves an authored line untouched', () => {
    const authored = cue(20);

    raiseDefaultCaptionLine([authored]);

    expect(authored.line).toBe(20);
    expect(authored.snapToLines).toBe(true);
    expect(authored.lineAlign).toBe('start');
  });

  it('has nothing to lift without cues', () => {
    expect(() => raiseDefaultCaptionLine([])).not.toThrow();
  });
});

describe('findChapterAtTime', () => {
  const chapters = [
    { startTime: 90, title: 'Theming' },
    { startTime: 0, title: 'Introduction' },
    { startTime: 30, title: 'Installing' },
  ];

  it('finds the chapter covering the position', () => {
    expect(findChapterAtTime(chapters, 0)?.title).toBe('Introduction');
    expect(findChapterAtTime(chapters, 29)?.title).toBe('Introduction');
    expect(findChapterAtTime(chapters, 30)?.title).toBe('Installing');
    expect(findChapterAtTime(chapters, 500)?.title).toBe('Theming');
  });

  it('has no chapter before the first one starts', () => {
    expect(findChapterAtTime([{ startTime: 5, title: 'Later' }], 0)).toBeNull();
  });

  it('has no chapter without chapters', () => {
    expect(findChapterAtTime([], 10)).toBeNull();
  });
});
