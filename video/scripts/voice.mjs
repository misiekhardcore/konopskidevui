/**
 * Turns an episode's narration into audio, one file per beat.
 *
 * Two engines:
 *
 *   voicebox  the local Voicebox app's cloned voice, through its HTTP API on
 *             127.0.0.1:17493. This is the series voice when it is running.
 *   kokoro    Kokoro-82M through `kokoro-js`: 82M parameters, Apache-2.0,
 *             CPU inference, no account. The offline fallback.
 *
 * The episode picks one with `engine`; `--engine` overrides it. Either way the
 * output is identical in shape and the timing contract is unchanged:
 *
 *   node video/scripts/voice.mjs --episode 01-palette
 *   node video/scripts/voice.mjs --episode 01-palette --only 04-tokens
 *   node video/scripts/voice.mjs --episode 01-palette --audition
 *   node video/scripts/voice.mjs --episode 01-palette --engine kokoro
 *
 * Output, all under `video/build`:
 *
 *   audio/<beat>.wav     24 kHz mono, silence-trimmed, -16 LUFS
 *   timeline.json        { beats: [{ id, audio, duration, voice, engine, words }] }
 */
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

import { parseArgs, paths, readEpisode, log, die } from './lib.mjs';

/* Kokoro's pick for the series read: male, mid-thirties. */
const SELECTED_VOICE = 'am_fenrir';
const SAMPLE_RATE = 24000;
const SENTENCE_GAP = 0.11;

/* Air before and after the words. Without a lead-in the narration resumes on
   the exact frame of the cut, which reads as abrupt; 0.55s lets the new scene
   settle first. The pause lives in the audio, so the beat's duration - and
   therefore the whole timing contract - still comes from one measurement. */
const LEAD = 0.55;
const PAD = 0.4;

/* The Voicebox app serves this while it is running. */
const VOICEBOX = process.env.VOICEBOX_URL ?? 'http://127.0.0.1:17493';
const VOICEBOX_TIMEOUT = 15 * 60_000;

const args = parseArgs(process.argv.slice(2));
const episode = readEpisode(args.episode);
const engine = args.engine ?? episode.engine ?? 'kokoro';

if (!['voicebox', 'kokoro'].includes(engine)) die(`unknown voice engine ${engine}`);

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

// Keep the Kokoro model cache inside the project; it downloads on first use.
process.env.HF_HOME = paths.hfCache;

/** Sentences are the unit of Kokoro synthesis: it degrades past ~40 words. */
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
 * Pure ffmpeg, so it can be re-run over existing takes (`--from-raw`), and it is
 * the same pass whichever engine produced the take.
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

/* ------------------------------------------------------------------- kokoro */

let kokoroTts = null;

async function kokoro() {
  if (kokoroTts) return kokoroTts;

  log('loading Kokoro-82M (first run downloads ~90 MB into video/build/hf-cache)');
  const { KokoroTTS } = await import('kokoro-js');
  kokoroTts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
    dtype: 'q8',
    device: 'cpu',
  });

  return kokoroTts;
}

async function kokoroSpeak(text, voice, speed) {
  const tts = await kokoro();
  const buffers = [];

  for (const sentence of sentences(text)) {
    const audio = await tts.generate(sentence, { voice, speed });
    buffers.push(audio.audio);
    log(`  ${voice} · ${sentence.slice(0, 64)}${sentence.length > 64 ? '…' : ''}`);
  }

  return wav(SAMPLE_RATE, buffers);
}

/* ----------------------------------------------------------------- voicebox */

async function voiceboxFetch(route, init = {}) {
  let response;

  try {
    response = await fetch(`${VOICEBOX}${route}`, {
      ...init,
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    die(
      `Voicebox is not answering at ${VOICEBOX} (${error.message}).\n` +
        'Open the Voicebox app and check Settings - MCP / API, then run this again.\n' +
        'Use --engine kokoro to voice the episode with the offline fallback instead.',
    );
  }

  return response;
}

/** A profile may be named in the episode; the API wants its id. */
async function voiceboxProfile(name) {
  const response = await voiceboxFetch('/profiles');
  if (!response.ok) die(`Voicebox /profiles answered ${response.status}`);

  const profiles = await response.json();
  const match = profiles.find(
    (profile) => profile.name.toLowerCase() === String(name).toLowerCase() || profile.id === name,
  );

  if (!match) {
    const available = profiles
      .map((profile) => `"${profile.name}" (${profile.language})`)
      .join(', ');
    die(`no Voicebox profile named "${name}". Available: ${available}`);
  }

  return match;
}

/** POST /generate, then poll until the take exists. */
async function voiceboxGenerate(profile, text) {
  const body = {
    profile_id: profile.id,
    text,
    language: profile.language ?? 'en',
    personality: episode.personality ?? false,
    normalize: false,
    /* The calm-teacher direction is an `instruct`, not the profile's personality
       prompt: that one rewrites the script, and the script is already written. */
    ...(episode.instruct ? { instruct: episode.instruct } : {}),
    engine: episode.voiceEngine ?? 'qwen_custom_voice',
  };

  const response = await voiceboxFetch('/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const created = await response.text();

  if (!response.ok) {
    die(`Voicebox /generate answered ${response.status}: ${created.slice(0, 400)}`);
  }

  const parsed = created ? JSON.parse(created) : {};
  const id = parsed.generation_id ?? parsed.id;
  if (!id) die(`Voicebox /generate returned no generation id: ${created.slice(0, 400)}`);

  const deadline = Date.now() + VOICEBOX_TIMEOUT;
  let status = 'generating';

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    const poll = await voiceboxFetch(`/generate/${id}/status`);
    if (!poll.ok) continue;

    const state = await poll.json();
    status = state.status ?? state.generation?.status ?? 'generating';
    if (['completed', 'complete', 'done', 'success', 'succeeded'].includes(status)) {
      return id;
    }
    if (['failed', 'error', 'cancelled', 'canceled'].includes(status)) {
      die(`Voicebox generation failed: ${JSON.stringify(state).slice(0, 400)}`);
    }
  }

  die(`Voicebox generation ${id} did not finish within ${VOICEBOX_TIMEOUT / 60_000} minutes`);
}

/** Find the take on disk, or download it, and write it to `target`. */
async function voiceboxTake(id, target) {
  const record = await voiceboxFetch(`/history/${id}`);
  if (record.ok) {
    const entry = await record.json();
    const file = entry.audio_path;

    if (file) {
      /* The API reports the path inside Voicebox's own data directory, which
         may be absolute or relative to it. Try the shapes this install uses. */
      const candidates = [
        file,
        path.join(homedir(), '.local', 'share', 'voicebox', file),
        path.join(homedir(), '.config', 'voicebox', file),
        path.join(homedir(), '.cache', 'voicebox', file),
      ];

      for (const candidate of candidates) {
        if (existsSync(candidate) && statSync(candidate).size > 0) {
          copyFileSync(candidate, target);
          return;
        }
      }
    }
  }

  /* Fallback: the audio endpoint, which may stream the file or point at it. */
  const audio = await voiceboxFetch(`/audio/${id}`);
  if (audio.ok) {
    const type = audio.headers.get('content-type') ?? '';

    if (type.startsWith('audio/')) {
      writeFileSync(target, Buffer.from(await audio.arrayBuffer()));
      return;
    }

    const payload = await audio.json().catch(() => null);
    const url = payload?.audio_url ?? payload?.url ?? payload?.audio_path;
    if (url && /^https?:/.test(url)) {
      const download = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      writeFileSync(target, Buffer.from(await download.arrayBuffer()));
      return;
    }
    if (payload?.audio_base64) {
      writeFileSync(target, Buffer.from(payload.audio_base64, 'base64'));
      return;
    }
  }

  die(`Voicebox finished generation ${id} but the audio could not be found`);
}

/** A calm-read `instruct` needs an engine that accepts one. */
async function voiceboxSpeak(text, profile, rawPath) {
  log(`  ${profile.name} · ${text.slice(0, 64)}${text.length > 64 ? '…' : ''}`);
  const id = await voiceboxGenerate(profile, text);
  await voiceboxTake(id, rawPath);
}

/* ---------------------------------------------------------------------- run */

const voice = args.voice ?? episode.voice ?? SELECTED_VOICE;
const speed = Number(args.speed ?? episode.speed ?? 1);
const profile = engine === 'voicebox' ? await voiceboxProfile(voice) : null;

log(`engine ${engine} · voice ${voice}${engine === 'voicebox' ? ` (${profile.language})` : ''}`);

if (args.audition) {
  const dir = path.join(paths.build, 'audition');
  mkdirSync(dir, { recursive: true });

  const raw = path.join(dir, `${voice}.raw.wav`);
  const out = path.join(dir, `${voice}.wav`);

  if (engine === 'voicebox') await voiceboxSpeak(beats[0].narration, profile, raw);
  else writeFileSync(raw, await kokoroSpeak(beats[0].narration, voice, speed));

  finish(raw, out);
  log(`${voice}.wav  ${duration(out).toFixed(2)}s`);
  log(`audition sample in ${path.relative(paths.root, dir)}`);
  process.exit(0);
}

const timeline = { episode: episode.id, voice, engine, voices: [voice], beats: [] };

for (const beat of beats) {
  const raw = path.join(paths.audio, `${beat.id}.raw.wav`);
  const out = path.join(paths.audio, `${beat.id}.wav`);

  process.stdout.write(`\n${beat.id}\n`);

  /* --from-raw re-processes the existing take: padding, loudness or format
     changes must not cost another full synthesis. */
  if (!(args.fromRaw && existsSync(raw))) {
    if (engine === 'voicebox') await voiceboxSpeak(beat.narration, profile, raw);
    else writeFileSync(raw, await kokoroSpeak(beat.narration, voice, speed));
  }
  finish(raw, out);

  const seconds = duration(out);
  timeline.beats.push({
    id: beat.id,
    audio: path.relative(paths.root, out),
    duration: Number(seconds.toFixed(3)),
    voice,
    engine,
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
