# The stage and the recorder

The stage is one HTML page at exactly 1920×1080. It renders a beat, animates it against the
beat's audio duration, and sets `window.__STAGE_READY` / `window.__STAGE_DONE` so the recorder
knows when to start and stop caring. Nothing is scaled, so no frame is ever resampled.

```
video/stage/index.html   the canvas
video/stage/stage.css    the look: the articles' palette and typefaces
video/stage/stage.js     the scene renderers and the timeline
video/scripts/serve.mjs  stage + figures + fonts + Storybook + the live app
video/scripts/record.mjs Playwright, one clip per beat
```

## Scenes

Every scene is declared in the beat's JSON. `duration` is not in the beat — it comes from the
audio, and the scene paces itself as fractions of it.

| `type`      | Fields                                              | What it shows                                               |
| ----------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `figure`    | `figure`, `steps[]`, `outro[]`                      | A generated figure, with sequential caption chips           |
| `cards`     | `kicker`, `title`, `cards[{label,title,body,tone}]` | An argument as three cards, revealed in order               |
| `terminal`  | `log`, `title`                                      | A real command transcript, replayed line by line            |
| `ide`       | `file`, `lines[]`, `typeUntil`                      | The editor, typing the file's lines                         |
| `ide-split` | `file`, `lines[]`, `preview`, `themeAt`, `scrollTo` | The editor beside the live app; the theme flips mid-beat    |
| `preview`   | `path`, `themeAt`                                   | A full browser pane: Storybook, in one theme then the other |

`lines` are the literal file contents, highlighted at request time by shiki (the same highlighter
the package ships), one token list per line so a line can be revealed without breaking its spans.

## The editor

The IDE is VS Code's own rendering: Monaco's colour semantics, explorer, tabs, breadcrumb, status
bar, in the editor's light theme so it matches the article figures. Typing is a clip-path reveal
over highlighted HTML plus a caret, driven by one `requestAnimationFrame` loop over the beat's
duration — no per-character DOM writes, and the speed is a consequence of the audio rather than a
setting.

A first attempt used `code-server` (VS Code's web workbench) inside the pane. It is the real
thing, but under automation Monaco's focus handling made typing unreliable across 14 beats, and
the workbench's own load time landed inside the recording. The stage's editor is deterministic
and 40 ms per frame; the trade is a lookalike _shell_ around the real editor engine, not a
recording of the real product. If you need the workbench, `video/build/code-server` is where the
tarball would go.

## The browser pane

`ide-split` and `preview` iframe a live server, never a screenshot:

- the app: `pnpm exec vite` on port 5174 inside `build/palette-demo`
- Storybook: the static build, served under `/storybook`

The theme switch is a real switch. For the app it is a `postMessage` that adds `.dark` to
`<html>` — the exact mechanism a consuming app uses, which is the point of the beat. For
Storybook it is `&globals=theme:dark` on the iframe URL, so the themes addon does the work.

## Recording

```sh
node video/scripts/cli.mjs record --episode 01-palette [--only 05-unlayered]
```

For each beat: a fresh browser context with `recordVideo` at 1920×1080, navigate to the stage
with `?beat=<id>&duration=<audio seconds>`, wait for `__STAGE_READY`, wait for `__STAGE_DONE`,
close the context, keep the webm.

Two details make this reliable:

- **The head is measured, not guessed.** Time between context creation and `__STAGE_READY` is
  stored as `head` in `clips.json`, and the assembler trims exactly that much. Loading can be
  300 ms or 3 s without affecting a single frame.
- **One beat at a time.** Playwright's screencast is real time; a single 7-minute take would
  accumulate encode drops. Separate clips also make `--only` meaningful.

Failure mode worth knowing: if the stage throws, `__STAGE_DONE` never arrives and the recorder
times out with the beat id in the message — check the browser console by serving the same URL
with `cli.mjs serve`.
