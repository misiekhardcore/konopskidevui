# Recipe: a new episode from an article

Six steps. Steps 1 and 2 are the editorial work and nothing automates them; the rest is a
command each.

## 1. Draft the beats from the article

```sh
pnpm video:new --article articles/02-sixty-three-components-one-rulebook.md
```

That parses the H1, the intro, every `##` section and the figures, and writes
`video/episodes/02-sixty-three-components-one-rulebook.json` with `"draft": true`: one beat per
section, the section's first sentences as placeholder narration, and a scene guessed from what
the section contains (a figure, a shell block, or a file path it mentions).

[`../assets/episode-template.json`](../assets/episode-template.json) is the same shape, written by
hand: every field the scripts read, and each of the six scene types once, with a line on when to
reach for it. Use it when a beat is easier to draw than to derive, or when the article is not the
source.

The draft is a skeleton. Section boundaries are not storytelling beats and the placeholder
narration is not speakable.

## 2. Write the narration and the scenes

Edit the beat sheet until each beat is one idea, spoken. What survived from episode 1:

- **Words decide the length.** Kokoro reads at roughly 130 words per minute, and every beat also
  spends about a second in the lead-in and tail, so 1,000 words across fourteen beats is close to
  eight minutes. Word count is the only length control you need before synthesis — and it is much
  cheaper to cut there than to re-record.
- **Condense, do not summarise.** The article's sentences carry the argument; drop the listings
  and the asides, keep the claims and the two mistakes.
- **Code is never read aloud.** Say what the code does, let the editor show it. A narration line
  like "every radius becomes the one radius" is worth 20 lines of `RULES` entries.
- **Numbers first.** Each beat's `caption` is the chapter title, so write it as one: "One class,
  both themes", not "Beat 5".
- **Scenes reuse what the article already has.** `figure` for a generated diagram, `workbench`
  for a file, `terminal` for a transcript, `workbench-split` for a change with its effect,
  `preview` for a live page, `cards` for an argument.

Scene types and their fields are listed in [`capture.md`](capture.md).

## 3. Voice it

```sh
pnpm video:audition --episode 02-…
pnpm video:voice    --episode 02-…
```

Listen to the audition before synthesising the whole thing: changing `voice` later re-renders
audio only, but it also means re-recording every clip, because clips are cut to their audio. Edit
the episode's `voice` and run the stage for **every** beat — `--only` over a new voice leaves a
mixed episode that still sounds like the old take, which is the mistake [`voice.md`](voice.md)
spends a section on.

`timeline.json` records each beat's final duration. That file is the contract between the voice
and the pictures.

## 4. Build the demo app (once per series)

```sh
pnpm video:sandbox
```

`palette-demo` is the project on screen: a real Vite + Tailwind v4 app carrying the repository's
stylesheets, plus the registry components and the terminal transcripts. It is built once and
reused by every episode in the series. Only re-run it with `--fresh` if the styles or the
registry transcript should change.

## 5. Record

```sh
pnpm video:record --episode 02-…
```

Real time, one clip per beat, roughly the video's duration plus a few seconds per beat. Use
`--only <id>` to redo a single beat.

## 6. Assemble

```sh
pnpm video:assemble --episode 02-…
```

Cuts each clip to its audio, concatenates, muxes the narration, writes chapters and an `.srt`,
and refuses to finish if video and narration disagree by more than a third of a second.

Output lands in `video/out/`.

## Definition of done

- `ffprobe` reports 1920x1080, h264 + aac, and a duration within a frame of the timeline total.
- One frame per beat, pulled out with `ffmpeg -ss <t> -frames:v 1`, actually shows the scene you
  meant: no half-loaded editor, no empty iframe, no caret mid-character.
- The SRT matches the narration, not the article.
- The video plays in a browser from a local server, with sound.
