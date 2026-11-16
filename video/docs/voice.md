# Narration

Kokoro-82M through [`kokoro-js`](https://www.npmjs.com/package/kokoro-js): 82M parameters,
Apache-2.0 weights, ONNX runtime on CPU, `device: 'cpu'`, `dtype: 'q8'`. No API key, no account,
no per-character cost, and no network once the weights are cached.

The weights land in `video/build/hf-cache` because `voice.mjs` sets `HF_HOME`. Without that they
go to `~/.cache/huggingface`, outside the project, which makes a fresh checkout slow and a clean
machine surprising.

## Voices

The series reads in a male, mid-thirties voice. `am_fenrir` is the default: calm, even, and it
holds a press through a seven-minute read. The alternatives worth hearing are `am_fenrir`
(brighter, a little more expressive) and `am_onyx` (lower and older). `am_puck` is the youngest of
the set. `speed` is 0.98 for episode 1 — Kokoro's default read is a touch brisk for a technical
sentence.

```sh
node video/scripts/cli.mjs audition --episode 01-palette
open video/build/audition/am_fenrir.wav     # then am_fenrir / am_onyx
```

Changing voice or speed re-renders audio, which changes every beat's duration, which means the
clips must be recorded again. Decide the voice before recording, not after.

## How a beat is synthesised

1. The narration is split on sentence boundaries. Kokoro degrades past roughly 40 words, so a
   paragraph is never fed in one piece.
2. Sentences are rendered separately and joined with a 110 ms gap, written as one 24 kHz 16-bit
   mono WAV per beat.
3. `ffmpeg` trims leading and trailing silence (`silenceremove`, reversed for the tail), applies
   `loudnorm=I=-16:TP=-1.5:LRA=11`, adds a **0.55 s lead-in** and a 0.4 s tail, and writes
   48 kHz mono — the sample rate the final mix uses.
4. `ffprobe` measures the result. That number is the beat's duration everywhere downstream.

The lead-in is the pause the edit needs. Without it the narration resumes on the exact frame of
`
the cut and the whole video feels clipped; with it, the new scene lands before the voice does.
Because the pause is inside the audio, changing it does not move any picture relative to any
word — it only changes how long the beat is. Re-processing after a change to the padding,
loudness or sample rate does not need another synthesis run:

```sh
node video/scripts/voice.mjs --episode 01-palette --from-raw
```

## Loudness

−16 LUFS integrated, −1.5 dBTP ceiling, per beat, so no beat is quieter than its neighbour and
nothing clips. Because every beat is normalised the same way, the concatenated narration is
already level — the assembler does not re-normalise the mix, which would pump.

## Pronunciation

Kokoro reads words, not symbols: `@theme inline` becomes "at theme inline" only if the narration
says so. The episode's transcript therefore spells out what must not be misread — "dot css",
"src slash styles", "radix nova", "color scheme" — and never contains naked punctuation that a
TTS engine would swallow. If a technical token must be heard exactly, spell it phonetically in
the narration; the caption and the SRT are generated from the same text, so they stay honest
about what was said.

## Cost and time

Episode 1: 950 words, 14 beats, about four minutes of CPU on this machine, model download once.
The model and cache are gitignored; a first run from a clean checkout costs the ~90 MB download.
