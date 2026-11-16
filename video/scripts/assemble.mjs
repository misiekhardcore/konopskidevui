/**
 * Assembles the clips into the finished video.
 *
 * Each segment is cut to its own narration, and crossfades are baked into the
 * segment ends rather than applied between them: an xfade between two clips
 * shortens the programme by its own length, which would push every caption after
 * it out of sync by an accumulating amount. A 120 ms fade from and to the page
 * colour reads as a cut on camera and keeps the timeline exact.
 *
 *   node video/scripts/assemble.mjs --episode 01-palette
 *   node video/scripts/assemble.mjs --episode 01-palette --crf 20
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  die,
  episodeIds,
  FRAME,
  log,
  parseArgs,
  paths,
  readEpisode,
  readTimeline,
  run,
} from './lib.mjs';

const FADE = 0.12;

const args = parseArgs(process.argv.slice(2));
const episodeId = args.episode ?? episodeIds()[0];
const episode = readEpisode(episodeId);
const timeline = readTimeline();
const clipsPath = path.join(paths.build, 'clips.json');

if (!existsSync(clipsPath)) die('no video/build/clips.json — run record.mjs first');

const clips = new Map(
  JSON.parse(readFileSync(clipsPath, 'utf8')).clips.map((clip) => [clip.id, clip]),
);
const durations = new Map(timeline.beats.map((beat) => [beat.id, beat.duration]));

/*
 * Two ways the finished video can be silently wrong, both caught before an
 * encode: narration recorded in more than one voice, and a clip filmed against
 * a duration its audio no longer has. Both happen the moment someone edits
 * `voice` and re-renders one beat, which otherwise produces a video that looks
 * right and sounds like the old take.
 */
const timelineVoices = timeline.voices ?? (timeline.voice ? [timeline.voice] : []);
if (timelineVoices.length > 1) {
  log(
    `warning: narration mixes ${timelineVoices.join(' + ')} — ` +
      `re-run voice.mjs for the whole episode before recording`,
  );
}

for (const beat of episode.beats) {
  const duration = durations.get(beat.id);
  const clip = clips.get(beat.id);
  if (!clip || !duration) continue;

  const drift = Math.abs(clip.duration - duration);
  if (drift > 0.5) {
    log(
      `warning: ${beat.id} was filmed for ${clip.duration.toFixed(2)}s but its ` +
        `narrated audio is ${duration.toFixed(2)}s — re-record it`,
    );
  }
}

mkdirSync(paths.out, { recursive: true });

const work = path.join(paths.build, 'segments');
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });

/* -------------------------------------------------------------- video pieces */

const segments = [];

for (const beat of episode.beats) {
  const clip = clips.get(beat.id);
  const duration = durations.get(beat.id);
  if (!clip || !duration) die(`missing clip or audio for ${beat.id}`);

  const source = path.join(paths.root, clip.file);
  const segment = path.join(work, `${beat.id}.mp4`);
  const fadeOut = Math.max(0, duration - FADE);

  process.stdout.write(`\n${beat.id}  ${duration}s from ${path.basename(source)}\n`);

  run('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    source,
    '-ss',
    String(clip.head),
    '-t',
    String(duration),
    '-vf',
    [
      `fps=${FRAME.fps}`,
      `scale=${FRAME.width}:${FRAME.height}:flags=lanczos`,
      'format=yuv420p',
      `fade=t=in:st=0:d=${FADE}`,
      `fade=t=out:st=${fadeOut.toFixed(3)}:d=${FADE}`,
    ].join(','),
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    String(args.preset ?? 'veryfast'),
    '-crf',
    String(args.crf ?? 18),
    '-pix_fmt',
    'yuv420p',
    '-r',
    String(FRAME.fps),
    segment,
  ]);

  segments.push({ file: segment, duration });
}

/* ------------------------------------------------------------------- audio */

const audioList = path.join(work, 'audio.txt');
writeFileSync(
  audioList,
  segments
    .map(
      (segment) => `file '${path.join(paths.audio, `${path.basename(segment.file, '.mp4')}.wav`)}'`,
    )
    .join('\n') + '\n',
);

const audio = path.join(work, 'narration.wav');
run('ffmpeg', [
  '-y',
  '-loglevel',
  'error',
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  audioList,
  '-c:a',
  'pcm_s16le',
  '-ar',
  '48000',
  '-ac',
  '1',
  audio,
]);

/* ------------------------------------------------------------- silent video */

const videoList = path.join(work, 'video.txt');
writeFileSync(videoList, segments.map((segment) => `file '${segment.file}'`).join('\n') + '\n');

const silent = path.join(work, 'video.mp4');
run('ffmpeg', [
  '-y',
  '-loglevel',
  'error',
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  videoList,
  '-c',
  'copy',
  silent,
]);

/* ---------------------------------------------------------------- chapters */

const chapters = [];
let cursor = 0;

for (const beat of episode.beats) {
  const duration = durations.get(beat.id);
  chapters.push(
    [
      '[CHAPTER]',
      'TIMEBASE=1/1000',
      `START=${Math.round(cursor * 1000)}`,
      `END=${Math.round((cursor + duration) * 1000)}`,
      `title=${beat.caption}`,
    ].join('\n'),
  );
  cursor += duration;
}

const chaptersFile = path.join(work, 'chapters.txt');
writeFileSync(chaptersFile, `;FFMETADATA1\n${chapters.join('\n')}\n`);

/* ----------------------------------------------------------------- the mix */

const output = path.join(paths.out, `${episode.output}.mp4`);

run('ffmpeg', [
  '-y',
  '-loglevel',
  'error',
  '-i',
  silent,
  '-i',
  audio,
  '-i',
  chaptersFile,
  '-map',
  '0:v:0',
  '-map',
  '1:a:0',
  '-map_metadata',
  '2',
  '-c:v',
  'copy',
  '-c:a',
  'aac',
  '-b:a',
  '192k',
  '-ar',
  '48000',
  '-movflags',
  '+faststart',
  '-shortest',
  output,
]);

/* --------------------------------------------------------------- subtitles */

/**
 * One cue per sentence, its length proportional to its share of the beat's
 * characters. The transcript is the source of truth, so captions cannot say
 * something the voice did not say.
 */
function srtTimestamp(seconds) {
  const ms = Math.round(seconds * 1000);
  const hh = String(Math.floor(ms / 3_600_000)).padStart(2, '0');
  const mm = String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, '0');
  const ss = String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0');
  return `${hh}:${mm}:${ss},${String(ms % 1000).padStart(3, '0')}`;
}

/** A cue longer than this is split at a comma: nobody reads 13s of text. */
const MAX_CUE = 7.5;

function chunks(sentence, duration) {
  const parts = sentence.split(/,\s+/).filter(Boolean);
  if (parts.length === 1) return [{ text: sentence, duration }];

  const total = parts.reduce((sum, part) => sum + part.length, 0);
  return parts.map((part, index) => ({
    text: index === parts.length - 1 ? part : `${part},`,
    duration: (part.length / total) * duration,
  }));
}

const cues = [];
let clock = 0;

for (const beat of episode.beats) {
  const duration = durations.get(beat.id);
  const sentences = beat.narration
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const total = sentences.reduce((sum, sentence) => sum + sentence.length, 0);

  let offset = 0;
  for (const sentence of sentences) {
    const share = (sentence.length / total) * duration;
    const split = share > MAX_CUE ? chunks(sentence, share) : [{ text: sentence, duration: share }];

    for (const piece of split) {
      cues.push({ start: clock + offset, end: clock + offset + piece.duration, text: piece.text });
      offset += piece.duration;
    }
  }

  clock += duration;
}

const srt = cues
  .map((cue, index) => {
    const wrapped = cue.text.replace(/(.{52}\S*)\s/g, '$1\n');
    return `${index + 1}\n${srtTimestamp(cue.start)} --> ${srtTimestamp(cue.end)}\n${wrapped}\n`;
  })
  .join('\n');

const srtPath = path.join(paths.out, `${episode.output}.srt`);
writeFileSync(srtPath, srt);

/* ---------------------------------------------------------------- reporting */

const probe = JSON.parse(
  run('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration:stream=codec_name,width,height,sample_rate,channels',
    '-of',
    'json',
    output,
  ]),
);

const videoStream = probe.streams.find((stream) => stream.codec_name === 'h264');
const audioStream = probe.streams.find((stream) => stream.codec_name === 'aac');

if (!videoStream || !audioStream) die('the output is missing a stream');
if (videoStream.width !== FRAME.width || videoStream.height !== FRAME.height) {
  die(`expected ${FRAME.width}x${FRAME.height}, got ${videoStream.width}x${videoStream.height}`);
}

const expected = episode.beats.reduce((sum, beat) => sum + durations.get(beat.id), 0);
const actual = Number(probe.format.duration);
const drift = Math.abs(actual - expected);

log(`\n${path.relative(paths.root, output)}`);
log(
  `  ${videoStream.width}x${videoStream.height} ${videoStream.codec_name} + ${audioStream.codec_name}`,
);
log(`  ${actual.toFixed(2)}s (beats total ${expected.toFixed(2)}s, drift ${drift.toFixed(2)}s)`);
log(`  ${cues.length} captions -> ${path.relative(paths.root, srtPath)}`);

if (drift > 0.35) die(`video and narration disagree by ${drift.toFixed(2)}s`);
