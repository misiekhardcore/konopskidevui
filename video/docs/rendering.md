# Rendering, and the timing contract

## The contract

```
timeline.json  (voice)  →  durations
clips.json     (record) →  head per clip + the duration it was recorded for
assemble.mjs            →  segments cut to durations, concatenated, muxed
```

The chain is one-way and the numbers are the same numbers. `assemble.mjs` recomputes the expected
total from the timeline and fails if the finished file disagrees by more than 0.35 s.

## Cutting

Each clip is trimmed from its measured `head` for exactly its beat duration:

```sh
ffmpeg -i clip.webm -ss <head> -t <duration> \
  -vf "fps=30,scale=1920:1080:flags=lanczos,format=yuv420p,fade=t=in:st=0:d=0.12,fade=t=out:st=<d-0.12>:d=0.12" \
  -an -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -r 30 segment.mp4
```

`-ss` after `-i` is the accurate (decode-and-discard) form; with clips this short the speed
difference is irrelevant and the frame-exactness is not.

**Fades instead of crossfades.** An `xfade` between two clips consumes its own duration, so every
cut would shorten the programme by 120 ms and every subsequent caption would drift further out of
sync. A 120 ms fade out of and into the page colour reads as a transition on camera, costs no
time, and keeps the contract exact. If you ever do want true crossfades, they have to be paid for
in the audio track too, with `acrossfade` of the same length.

## Encoding

- Segments: `libx264`, `preset veryfast`, `crf 18`, 30 fps, `yuv420p`. The frame size and rate
  are `FRAME` in [`scripts/lib.mjs`](../scripts/lib.mjs) — the stage layout, the recorder viewport
  and these flags read the same constant.
- Concat: stream copy (identical parameters, so no re-encode)
- Final mux: video copy + AAC 192 kb/s 48 kHz, `-movflags +faststart` for instant web playback
- Chapters: an FFMETADATA1 file, one chapter per beat, named by the beat's caption

## Subtitles

The `.srt` comes from the narration, not the article. Each beat is split into sentences and the
beat's duration is divided in proportion to character count — good enough that a cue never leads
or lags the voice by a visible amount, without needing forced alignment. If you ever need
word-accurate captions, that is a Whisper pass over `build/audio`, not a rewrite of the pipeline.

## Verifying

```sh
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height \
  -of json video/out/01-the-palette-is-the-product.mp4

# one frame per beat, at its midpoint
ffmpeg -ss <t> -i out.mp4 -frames:v 1 -q:v 2 frame.png
```

Look at the frames. A build can pass every check and still show a half-painted editor; the
checks prove the file is well-formed, the frames prove it is the video you meant.
