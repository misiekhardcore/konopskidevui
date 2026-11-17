# Tutorial videos

Turns an article in [`articles/`](../articles) into a narrated, screen-recorded tutorial:
voiceover from a local model, a real project built from scratch and coded on screen, and an
H.264 MP4 with chapters and subtitles.

Episode 1 — **The palette is the product** — is the worked example. The machinery is generic:
a new episode is a beat sheet, not new code.

```
video/
  episodes/01-palette.json   the transcript and the scene for every beat
  scripts/                   the pipeline (see below)
  stage/                     the 1920x1080 compositor the recorder films
  build/                     generated: model cache, audio, clips, demo app  (gitignored)
  out/                       generated: the MP4 and the SRT                (gitignored)
```

The know-how lives with the agent skill that drives this, in
[`.claude/skills/tutorial-video/`](../.claude/skills/tutorial-video/SKILL.md): the recipe for
turning an article into an episode, the notes on voice, capture and rendering, the troubleshooting
page, and [`episode-template.json`](../.claude/skills/tutorial-video/assets/episode-template.json)
— the annotated shape a new beat sheet starts from.

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
pnpm video:terminals    # every terminal beat, filmed as a real session -> video/build/terminals
pnpm video:record       # one clip per beat          -> video/build/clips + clips.json
pnpm video:assemble     # cut, mux, caption         -> video/out/*.mp4 + *.srt
```

Every command takes `--episode <id>` (default: the first episode) and the last three take
`--only 05-unlayered`, which re-does a single beat — the loop you actually live in: change one
sentence, re-render one line. Changing `voice` is the exception; it re-renders every beat and
every clip, and the scripts refuse to pretend otherwise (see
[`voice.md`](../.claude/skills/tutorial-video/reference/voice.md)).

`pnpm video:clean` deletes `video/build` (the ~400 MB of derived audio, clips, demo app and model
cache) and, unless you pass `--keep-output`, `video/out`.

Anything the scripts do, `node video/scripts/cli.mjs <stage>` does identically — the pnpm scripts
are one-line wrappers for humans.

Result: `video/out/01-the-palette-is-the-product.mp4` and `.srt`.

Requirements: `ffmpeg`, Node 22+, and a pnpm install of this repository. Narration runs locally
on CPU through `kokoro-js` — no API key, no network after the first model download (~90 MB into
`video/build/hf-cache`).

Two of the four stages film real programs, and each needs its tool unpacked into `video/build`
(never installed system-wide):

- **terminal beats** — [`vhs`](https://github.com/charmbracelet/vhs) plus `ttyd`. `ttyd` is
  commonly packaged; `vhs` is a single Go binary:
  `GOBIN=$PWD/video/build/bin go install github.com/charmbracelet/vhs@v0.12.1`.
- **editor beats** — code-server, whose web client is the VS Code workbench. Chapter and verse in
  [`capture.md`](../.claude/skills/tutorial-video/reference/capture.md).

## The three ideas worth knowing

**The transcript is the source of truth.** Every beat carries its narration and its scene in the
same JSON. Audio, clips, subtitles and chapters all derive from it, so nothing can disagree
except by editing.

**Beats are recorded separately, against their own audio.** Each clip lasts exactly as long as
the sentence it illustrates. There is no long take to keep in sync and no drift to correct; a
mistake costs one beat. The stage is handed the duration and paces itself — typing speed,
reveals and theme switches are fractions of that duration, not hardcoded timings.

**The screen is real.** The demo app in `build/palette-demo` is a Vite + Tailwind v4 project with
the repository's own stylesheets, built by `sandbox.mjs`. The terminal beats are VHS recordings of
an actual pty running the transcript's commands; the editor beats are the actual VS Code
workbench, typing into the actual files. Nothing is replayed text drawn to look like a program —
see [`capture.md`](../.claude/skills/tutorial-video/reference/capture.md) for how, and for what
is still drawn.

## Where to go next

The skill is the manual; these are its pages, in the order you would need them:

- [`recipe.md`](../.claude/skills/tutorial-video/reference/recipe.md) — turning another article
  into an episode
- [`voice.md`](../.claude/skills/tutorial-video/reference/voice.md) — the model, the voices,
  loudness
- [`capture.md`](../.claude/skills/tutorial-video/reference/capture.md) — the stage, the IDE, the
  recorder
- [`rendering.md`](../.claude/skills/tutorial-video/reference/rendering.md) — ffmpeg settings and
  the timing contract
