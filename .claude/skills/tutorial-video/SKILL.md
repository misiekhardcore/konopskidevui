---
name: tutorial-video
description: Turn an article in this repository into a narrated, screen-recorded tutorial video - voiceover from a local TTS model, a real project coded on screen, and an MP4 with chapters and subtitles. Use when asked to make a video from one of the articles, re-render a beat, change the narration or the voice, or add an episode for another part of the series.
---

# Tutorial videos

`video/` holds a working pipeline, proven by episode 1 (`01-palette`). A new episode is a beat
sheet, not new code — start it from
[`assets/episode-template.json`](assets/episode-template.json), which is the annotated shape of
one: every field the scripts read, and every scene type once.

This file is the order of operations and the invariants. The detail lives beside it:

| Reference                                                      | What it answers                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`reference/recipe.md`](reference/recipe.md)                   | Article → episode, step by step, and the definition of done        |
| [`reference/voice.md`](reference/voice.md)                     | The model, the voices, loudness, and why a voice change re-records |
| [`reference/capture.md`](reference/capture.md)                 | The stage, the six scene types and their fields, the recorder      |
| [`reference/rendering.md`](reference/rendering.md)             | ffmpeg settings and the timing contract                            |
| [`reference/troubleshooting.md`](reference/troubleshooting.md) | Symptom first. Read it before debugging.                           |

## Pipeline

```sh
pnpm video:sandbox                                  # the demo app + terminal transcripts, once per series
pnpm video:new     --article articles/02-….md       # skeleton beat sheet; editorial work follows
pnpm video:audition --episode 02-…                  # first beat; --voice am_onyx to compare
pnpm video:voice    --episode 02-…
pnpm video:record   --episode 02-…  [--only <beat-id>]
pnpm video:assemble --episode 02-…
```

`pnpm video` runs voice → record → assemble. Output: `video/out/<episode>.mp4` + `.srt`.
Every one of these is a one-line wrapper around `node video/scripts/cli.mjs <stage>`, which takes
the same flags — use whichever reads better.

## Invariants

- **The beat sheet is the source of truth.** Audio, clips, subtitles and chapters all derive from
  `video/episodes/<id>.json`. Never hand-edit a duration; it comes from `ffprobe` on the audio.
- **Durations flow one way:** voice → `build/timeline.json` → record (ingests duration) →
  `build/clips.json` → assemble. A stage never keeps its own clock.
- **`voice` in the beat sheet is a request, not the audio.** It does nothing until the voice stage
  runs for every beat; `--only` over a different voice mixes two narrators into one video.
- **Scenes pace themselves.** Anything animated is a fraction of the beat duration. There are no
  hardcoded timings to keep in sync, and no crossfade that costs time.
- **Beats are recorded separately.** Real time, one clip each, head trimmed by measurement.
  `--only` is the iteration loop: one sentence, one clip.
- **The screen must be real.** The demo app is a Vite dev server, the terminal is captured
  command output, Storybook is the real build. Waits are _cut_ and marked `…`, never sped up, and
  never faked. If a command genuinely fails, either fix the code or say so in the narration.
- **Speech is written for the ear.** Spell out what must not be misread ("dot css", "src slash
  styles"). Code is described, never read aloud.
- **Verify the pictures, not just the file.** `ffprobe` proves the container; extracting one frame
  per beat proves the video. Do both.

## Length

Kokoro reads ~135 words/minute. 850 words ≈ 6:15. Decide the length in words before synthesising;
changing it afterwards means re-recording every clip.

## Before recording

1. `voice` has written `build/timeline.json`.
2. `sandbox` has run (the app, the transcripts, `src/styles`).
3. Storybook exists — `serve.mjs` builds it once on first use.
4. Ports 4517 (stage) and 5174 (app) are free; the recorder picks nothing else.
5. Serve one beat and look at it: `node video/scripts/cli.mjs serve --episode 02-…`, then open
   `http://127.0.0.1:4517/?beat=<id>&duration=20`.

## Traps already paid for

[`reference/troubleshooting.md`](reference/troubleshooting.md) — the shadcn alias directory, the
`onnxruntime-node` build scripts, the JSONC tsconfig, Monaco focus, and the head-trim done wrong.

And the one that costs a whole re-render rather than an error: editing `voice`, running `voice
--only <one beat>`, then `record --only <one beat>` and `assemble` produces a video that looks
newer and sounds identical. `assemble` now warns on mixed voices and on clips filmed for a
different duration, but the fix is to re-run `voice` and `record` for the whole episode — see
[`reference/voice.md`](reference/voice.md).
