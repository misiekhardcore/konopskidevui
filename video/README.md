# Tutorial videos

Turns an article in [`articles/`](../articles) into a narrated, screen-recorded tutorial:
voiceover from a local model, a real project built from scratch and coded on screen, and an
H.264 MP4 with chapters and subtitles.

Episode 1 — **The palette is the product** — is the worked example. The machinery is generic:
a new episode is a beat sheet, not new code.

```
video/
  episodes/01-palette.json   the transcript and the scene for every beat
  episodes/_template.json    the shape a new episode starts from
  scripts/                   the pipeline (see below)
  stage/                     the 1920x1080 compositor the recorder films
  docs/                      recipe, voice, capture, rendering notes
  build/                     generated: model cache, audio, clips, demo app  (gitignored)
  out/                       generated: the MP4 and the SRT                (gitignored)
```

## Quickstart

```sh
pnpm video:sandbox      # the demo app + real terminal transcripts, once per series
pnpm video:audition     # beat 1 in the episode's voice (--voice am_onyx to compare)
pnpm video              # voice, record, assemble — the whole episode
```

`pnpm video` is the five-minute path. The stages are also separate, which is what a partial
change needs:

```sh
pnpm video:voice        # narration for every beat  -> video/build/audio + timeline.json
pnpm video:record       # one clip per beat          -> video/build/clips + clips.json
pnpm video:assemble     # cut, mux, caption         -> video/out/*.mp4 + *.srt
```

Every command takes `--episode <id>` (default: the first episode) and the last three take
`--only 05-unlayered`, which re-does a single beat — the loop you actually live in: change one
sentence, re-render one line. Changing `voice` is the exception; it re-renders every beat and
every clip, and the scripts refuse to pretend otherwise (see [`docs/voice.md`](docs/voice.md)).

`pnpm video:clean` deletes `video/build` (the ~400 MB of derived audio, clips, demo app and model
cache) and, unless you pass `--keep-output`, `video/out`.

Anything the scripts do, `node video/scripts/cli.mjs <stage>` does identically — the pnpm scripts
are one-line wrappers for humans.

Result: `video/out/01-the-palette-is-the-product.mp4` and `.srt`.

Requirements: `ffmpeg`, Node 22+, and a pnpm install of this repository. Narration runs locally
on CPU through `kokoro-js` — no API key, no network after the first model download (~90 MB into
`video/build/hf-cache`).

## The three ideas worth knowing

**The transcript is the source of truth.** Every beat carries its narration and its scene in the
same JSON. Audio, clips, subtitles and chapters all derive from it, so nothing can disagree
except by editing.

**Beats are recorded separately, against their own audio.** Each clip lasts exactly as long as
the sentence it illustrates. There is no long take to keep in sync and no drift to correct; a
mistake costs one beat. The stage is handed the duration and paces itself — typing speed,
reveals and theme switches are fractions of that duration, not hardcoded timings.

**The screen is real.** The demo app in `build/palette-demo` is a Vite + Tailwind v4 project with
the repository's own stylesheets, built by `sandbox.mjs`; the browser pane is that dev server,
and the terminal replays genuine command output captured during that build. Long waits are cut
and marked `…`, never sped up.

## Where to go next

- [`docs/recipe.md`](docs/recipe.md) — turning another article into an episode
- [`docs/voice.md`](docs/voice.md) — the model, the voices, loudness
- [`docs/capture.md`](docs/capture.md) — the stage, the IDE, the recorder
- [`docs/rendering.md`](docs/rendering.md) — ffmpeg settings and the timing contract
