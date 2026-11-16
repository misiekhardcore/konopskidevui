/**
 * Turns an episode's narration into audio, one file per beat.
 *
 * The model is Kokoro-82M through `kokoro-js`: 82M parameters, Apache-2.0
 * weights, CPU inference, no API key and no network after the first run. The
 * weights are cached under `video/build/hf-cache` (through `HF_HOME`) so a
 * checkout keeps its model inside the project instead of in the home directory.
 *
 *   node video/scripts/voice.mjs --episode 01-palette
 *   node video/scripts/voice.mjs --episode 01-palette --only 04-tokens
 *   node video/scripts/voice.mjs --episode 01-palette --audition
 *
 * Output, all under `video/build`:
 *
 *   audio/<beat>.wav     24 kHz mono, silence-trimmed, -16 LUFS
 *   timeline.json        { beats: [{ id, audio, duration, words }] }
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { parseArgs, paths, readEpisode, log, die } from './lib.mjs';

/* The series reads in a male, mid-thirties register. `am_fenrir` is the pick;
   `am_michael` and `am_onyx` are the alternatives worth auditioning. */
const SELECTED_VOICE = 'am_fenrir';
const SAMPLE_RATE = 24000;
const SENTENCE_GAP = 0.11;

/* Air before and after the words. Without a lead-in the narration resumes on
   the exact frame of the cut, which reads as abrupt; 0.55s lets the new scene
   settle first. The pause lives in the audio, so the beat's duration - and
   therefore the whole timing contract - still comes from one measurement. */
const LEAD = 0.55;
const PAD = 0.4;

const args = parseArgs(process.argv.slice(2));
const episode = readEpisode(args.episode);
/* `--only 01,10` re-voices two beats; a bare prefix matches what it starts. */
const only = args.only
  ? String(args.only)
      .split(',')
      .map((id) => id.trim())
  : null;
const beats = only
  ? episode.beats.filter((beat) => only.some((id) => beat.id === id || beat.id.startsWith(id)))
  : episode.beats;

if (beats.length === 0) die(`no beat matches --only ${args.only}`);

mkdirSync(paths.audio, { recursive: true });
mkdirSync(paths.hfCache, { recursive: true });

// Keep the model cache inside the project; kokoro-js downloads on first use.
process.env.HF_HOME = paths.hfCache;

/** Sentences are the unit of synthesis: Kokoro degrades past ~40 words. */
function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** A 16-bit PCM WAV from one float buffer per sentence, joined with a gap. */
function wav(sampleRate, buffers) {
  const gap = Math.round(sampleRate * SENTENCE_GAP);
  const total = buffers.reduce((sum, buffer) => sum + buffer.length + gap, 0);
  const pcm = new Int16Array(total);
  let offset = 0;

  for (const buffer of buffers) {
    for (let i = 0; i < buffer.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      pcm[offset + i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    offset += buffer.length + gap;
  }

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.byteLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.byteLength, 40);

  return Buffer.concat([header, Buffer.from(pcm.buffer)]);
}

/**
 * Trim edge silence, normalise to -16 LUFS, and add the lead-in and the tail.
 * Pure ffmpeg, so it can be re-run over existing takes (`--from-raw`).
 */
function finish(rawPath, outPath) {
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-loglevel',
      'error',
      '-i',
      rawPath,
      '-af',
      [
        'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05',
        'areverse',
        'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08',
        'areverse',
        'loudnorm=I=-16:TP=-1.5:LRA=11',
        `adelay=${Math.round(LEAD * 1000)}:all=1`,
        `apad=pad_dur=${PAD}`,
      ].join(','),
      '-ar',
      '48000',
      '-ac',
      '1',
      '-c:a',
      'pcm_s16le',
      outPath,
    ],
    { stdio: ['ignore', 'inherit', 'inherit'] },
  );
}

function duration(file) {
  const out = execFileSync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  return Number(String(out).trim());
}

log('loading Kokoro-82M (first run downloads ~90 MB into video/build/hf-cache)');
const { KokoroTTS } = await import('kokoro-js');
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
  dtype: 'q8',
  device: 'cpu',
});

async function speak(text, voice, speed) {
  const buffers = [];
  for (const sentence of sentences(text)) {
    const audio = await tts.generate(sentence, { voice, speed });
    buffers.push(audio.audio);
    log(`  ${voice} · ${sentence.slice(0, 64)}${sentence.length > 64 ? '…' : ''}`);
  }
  return wav(SAMPLE_RATE, buffers);
}

if (args.audition) {
  const dir = path.join(paths.build, 'audition');
  mkdirSync(dir, { recursive: true });
  /* `--voice am_onyx` auditions a candidate against the same sentence, which is
     the only fair comparison: same words, same speed, same loudness pass. */
  const candidate = args.voice ?? episode.voice ?? SELECTED_VOICE;

  const raw = path.join(dir, `${candidate}.raw.wav`);
  const out = path.join(dir, `${candidate}.wav`);
  writeFileSync(raw, await speak(beats[0].narration, candidate, episode.speed ?? 1));
  finish(raw, out);
  log(`${candidate}.wav  ${duration(out).toFixed(2)}s`);

  log(`audition sample in ${path.relative(paths.root, dir)}`);
  process.exit(0);
}

const voice = args.voice ?? episode.voice ?? SELECTED_VOICE;
const speed = Number(args.speed ?? episode.speed ?? 1);
log(`voice ${voice} · speed ${speed}`);
const timeline = { episode: episode.id, voice, voices: [voice], beats: [] };

for (const beat of beats) {
  const raw = path.join(paths.audio, `${beat.id}.raw.wav`);
  const out = path.join(paths.audio, `${beat.id}.wav`);

  process.stdout.write(`\n${beat.id}\n`);

  /* --from-raw re-processes the existing take: padding, loudness or format
     changes must not cost another full synthesis. */
  if (!(args.fromRaw && existsSync(raw))) {
    writeFileSync(raw, await speak(beat.narration, voice, speed));
  }
  finish(raw, out);

  const seconds = duration(out);
  timeline.beats.push({
    id: beat.id,
    audio: path.relative(paths.root, out),
    duration: Number(seconds.toFixed(3)),
    voice,
    words: beat.narration.split(/\s+/).length,
  });

  log(`  -> ${seconds.toFixed(2)}s`);
}

// A partial run (--only) must not lose the beats it did not touch.
const timelinePath = path.join(paths.build, 'timeline.json');
if (args.only && existsSync(timelinePath)) {
  const existing = JSON.parse(readFileSync(timelinePath, 'utf8'));
  const merged = new Map(beats.map((beat) => [beat.id, true]));
  timeline.beats = [
    ...existing.beats.filter((beat) => !merged.has(beat.id)),
    ...timeline.beats,
  ].sort((a, b) => (a.id < b.id ? -1 : 1));
  /* Report every voice still present, not the last one asked for: a partial run
     over a different voice leaves a mixed timeline, and calling it `voice`
     alone is how a video ends up narrated by two people in silence. */
  timeline.voices = [...new Set(timeline.beats.map((beat) => beat.voice ?? voice))];
  timeline.voice = timeline.voices.length === 1 ? timeline.voices[0] : 'mixed';
}

writeFileSync(timelinePath, `${JSON.stringify(timeline, null, 2)}\n`);

const total = timeline.beats.reduce((sum, beat) => sum + beat.duration, 0);
const words = timeline.beats.reduce((sum, beat) => sum + beat.words, 0);
log(
  `\n${timeline.beats.length} beats · ${words} words · ${Math.floor(total / 60)}m ${Math.round(total % 60)}s`,
);

if (timeline.voices?.length > 1) {
  const byVoice = timeline.beats.reduce((groups, beat) => {
    groups[beat.voice] = (groups[beat.voice] ?? 0) + 1;
    return groups;
  }, {});
  const counts = Object.entries(byVoice)
    .map(([name, count]) => `${name} ${count}`)
    .join(', ');

  log(
    `\nmixed narration: ${counts}.\n` +
      `Clips are cut to their audio, so re-record all of them:\n` +
      `  node video/scripts/cli.mjs record --episode ${episode.id}\n` +
      `  node video/scripts/cli.mjs assemble --episode ${episode.id}`,
  );
  process.exitCode = 1;
}
