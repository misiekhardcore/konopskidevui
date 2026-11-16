# The stage, the terminal and the recorder

Two things are filmed, and neither is a drawing of a program:

- **the stage**, one HTML page at exactly 1920×1080, for figures, cards and the Storybook pane;
- **the real programs**, for anything that is an editor or a shell.

The stage page also draws the caption strip and the progress bar. `video/stage/overlay.css` holds
those two elements and nothing else, so the recorder can inject them into a foreign page and the
chrome still has exactly one definition.

```
video/stage/index.html     the canvas
video/stage/overlay.css    caption + progress: shared with the workbench page
video/stage/stage.css      the look: the articles' palette and typefaces
video/stage/stage.js       the scene renderers and the timeline
video/scripts/vhs.mjs      the terminal beats, filmed as real shell sessions
video/scripts/workbench.mjs  code-server: the real VS Code workbench
video/scripts/serve.mjs    stage + figures + terminal clips + fonts + Storybook + Vite + code-server
video/scripts/record.mjs   Playwright, one clip per beat
```

## Scenes

Every scene is declared in the beat's JSON. `duration` is not in the beat — it comes from the
audio, and the scene paces itself as fractions of it.

| `type`            | Fields                                              | What it shows                                                  |
| ----------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| `figure`          | `figure`, `steps[]`, `outro[]`                      | A generated figure, with sequential caption chips              |
| `cards`           | `kicker`, `title`, `cards[{label,title,body,tone}]` | An argument as three cards, revealed in order                  |
| `terminal`        | `log`, plus `workspace`/`reset`/`skip`              | A real shell session, filmed by VHS                            |
| `workbench`       | `file`, `lines[]`, `prefill`                        | The real VS Code workbench, typing the file's lines            |
| `workbench-split` | `file`, `lines[]`, `preview`, `themeAt`, `scrollTo` | The workbench beside the live app, in VS Code's Simple Browser |
| `preview`         | `path`, `themeAt`                                   | A full browser pane: Storybook, in one theme then the other    |

## The terminal

`vhs.mjs` turns each `terminal` beat into a [VHS](https://github.com/charmbracelet/vhs) tape: the
transcript's own commands, typed into a pty served by `ttyd`, filmed by Chromium and encoded with
ffmpeg. The commands and the output on screen are the shell's.

A beat declares what the session needs before it starts:

```json
"workspace": "scratch"          // an empty dir, for `pnpm create vite` ("app" is the default)
"workspace": "from:10-registry" // carry on from another beat's session
"reset": ["src/components/ui"]  // removed from the copy first
"skip": [2]                     // a step that exists for the article, not the screen
```

`skip` exists because a transcript was captured one shell-process per step, and a capture can
contain a command a live session cannot repeat (counting the library's 63 components from the
repo root, for instance). The video shows what a person could really type; the article keeps its
own numbers.

Three things are worth knowing:

- **Nothing is typed off camera.** VHS's `Hide` hides the animation, not the pty's echo, so a
  "secret" setup command still appears on screen. There are no hidden commands: the tape is the
  session.
- **Pacing is measured, not guessed.** `vhs.mjs` runs the steps once in a throwaway copy, times
  each one, and sleeps `runtime × 1.1 + reading time` after typing it. VHS can wait for a string
  on screen, but a short token like `Done in` also matches the previous step's output, which is
  how the first version of this deadlocked.
- **The workspace lives in the temp dir.** A scaffold prints its own path, and this machine's
  checkout has no business on screen.

Fonts come from a project-local fontconfig (`build/fontconfig/fonts.conf`) rather than the user's
font directory, and JetBrains Mono is downloaded once into `build/fonts`. `XDG_DATA_HOME` is
deliberately not touched: pnpm reads it, and pointing it at the repo made `pnpm` announce its
store path in every beat.

## The workbench

`code-server` is unpacked into `build/code-server` and started once per render on
`127.0.0.1:4525`, with `--auth none`. That is an unauthenticated editor with a real shell: it is
bound to loopback, lives for the length of a render, and must never be exposed.

The profile in `video/vscode/` is copied into the workbench's user dir on every start, and its
remembered layout is deleted with it, so a beat looks the same however many times it is filmed.
The settings that matter for typing are `autoClosingBrackets: "never"`, `autoClosingQuotes:
"never"`, `autoIndent: "none"`, `formatOnType: false` and the suggestion and hover toggles: with
them on, typing `{` writes two and a beat's file comes out wrong.

Then, per beat:

1. open the workbench with `?folder=`, wait for the explorer to have rows;
2. open the file through Quick Open (`Ctrl+P`), which is what a person does;
3. for `workbench-split`, `Ctrl+\` and `Simple Browser: Show` beside it, pointed at the live app;
4. inject `overlay.css`, the caption and the progress bar, and start the beat's clock;
5. click into the editor, `Ctrl+End`, and type line by line with the per-character delay taken
   from the audio;
6. `Ctrl+S`, then **compare the file on disk with the beat sheet byte for byte** — a dropped
   character, a doubled brace or a bad auto-indent fails the beat instead of shipping;
7. put the original file back, because the demo app is a live server and the next beat shows it.

Everything before step 4 happens while the clip's `head` is being measured, so it is trimmed.

The workbench page also gets a 46 px band above it for the caption, in place of code-server's
browser-ish title bar. Everything under that band is the workbench itself.

`themeAt` adds `.dark` to the preview frame's document at that fraction of the beat — the same
class a consuming app sets — and `scrollTo` scrolls the frame. Both are scheduled on the
recording's clock, so they land where the narration says they will.

## Why this replaced the drawn editor

The first version of this pipeline drew an IDE shell in the stage: explorer, tabs, breadcrumb and
a clip-path typing reveal over shiki-highlighted HTML. It was a lookalike, and it was a lookalike
because an earlier `code-server` attempt typed into an **iframe** and lost keystrokes. The iframe
was the problem, not code-server: filmed on its own page, with the file opened by Quick Open and
the focus claimed by a click, the real workbench types reliably. The drawn editor, its CSS and
its renderers are gone rather than left beside the real thing. The assembled episode is
mostly real software; the remaining drawn surface is the browser chrome around the Storybook pane,
and the captions.
