/**
 * Renders every `terminal` beat as a real shell session with VHS.
 *
 * The commands are the transcript's own commands, typed into a genuine pty by
 * ttyd and filmed by VHS, so what the beat shows is what the shell printed. The
 * clip lands in build/terminals and the stage plays it inside the terminal card,
 * which keeps one caption/progress implementation for the whole episode.
 *
 * A beat declares what the session needs before it starts:
 *
 *   "workspace": "app"        a copy of build/palette-demo (default)
 *   "workspace": "scratch"    an empty directory, for `pnpm create vite`
 *   "workspace": "from:<id>"  continue where another beat's session left off
 *   "reset":     ["src/components/ui"]                          removed from the copy first
 *   "skip":      [2]          a step that exists for the article, not the screen
 *
 * The typed commands come from the transcript unchanged, so they have to be
 * valid in one long-lived shell: a `cd` in one step is still in effect in the
 * next. VHS cannot hide typed input (the pty echoes it), so nothing is typed
 * off camera.
 *
 *   node video/scripts/vhs.mjs --episode 01-palette [--only 03-scaffold]
 */
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  die,
  episodeIds,
  log,
  parseArgs,
  paths,
  readEpisode,
  readTimeline,
  root,
  run,
  spawnCapture,
  TERMINAL,
} from './lib.mjs';

const FONT_URL =
  'https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip';
const FONT_FACES = ['Regular', 'Bold', 'Italic', 'Medium'];

/* The same colours the article's figures use, as close as a terminal theme gets. */
const THEME = 'Github';
const SHELL = 'bash';

/* A transcript must never leave a full-screen program holding the pty: the next
   `Type` goes into the pager, the command never runs, and the clip still looks
   plausible. Pager environment off, and a prompt the tape can wait for. */
const SHELL_ENV = [
  'export PAGER=cat GIT_PAGER=cat GIT_EDITOR=true LESS=FRX GIT_TERMINAL_PROMPT=0',
  "export PS1='$ '",
  'unalias -a 2>/dev/null || true',
  '',
].join('\n');

/* What a blocked shell says on screen. Checked in the probe output too, because
   a command can print one without leaving anything open. */
const STUCK = ['press RETURN', '--More--', 'Log file is already in use', 'Entering Ex mode'];

const args = parseArgs(process.argv.slice(2));
const episodeId = args.episode ?? episodeIds()[0];
if (!episodeId) die('no episodes in video/episodes');

/* The tapes run in the temp dir, not under build/: a scaffold prints its own
   working directory, and this machine's checkout has no business on screen. */
const WORKSPACES = path.join(tmpdir(), 'konopskidev-video');

const episode = readEpisode(episodeId);
const timeline = readTimeline();
const durations = new Map(timeline.beats.map((beat) => [beat.id, beat.duration]));

const only = args.only
  ? String(args.only)
      .split(',')
      .map((id) => id.trim())
  : null;
const beats = (
  only
    ? episode.beats.filter((beat) => only.some((id) => beat.id === id || beat.id.startsWith(id)))
    : episode.beats
).filter((beat) => beat.scene.type === 'terminal');

if (beats.length === 0) die('no terminal beat to render');

/* --------------------------------------------------------------------- tools */

function which(command) {
  for (const dir of [paths.bin, ...(process.env.PATH ?? '').split(path.delimiter)]) {
    const candidate = path.join(dir, command);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function ensureTools() {
  const missing = ['ttyd', 'unzip'].filter((tool) => !which(tool));
  const vhs = which('vhs');

  if (missing.length) {
    die(`missing ${missing.join(', ')}. VHS records a pty through ttyd: install them first.`);
  }
  if (!vhs) {
    die(
      `no vhs binary. Install it into ${path.relative(root, paths.bin)}: ` +
        `GOBIN=$PWD/${path.relative(root, paths.bin)} go install github.com/charmbracelet/vhs@v0.12.1`,
    );
  }
  return vhs;
}

/* VHS films Chromium, which resolves fonts through fontconfig, so the typeface
   is installed project-locally rather than into the user's font directory. */
function ensureFonts() {
  if (FONT_FACES.every((face) => existsSync(path.join(paths.fonts, `JetBrainsMono-${face}.ttf`)))) {
    return;
  }

  log('downloading JetBrains Mono for the terminal (once, ~2 MB)');
  mkdirSync(paths.fonts, { recursive: true });

  const archive = path.join(paths.fonts, 'JetBrainsMono.zip');
  run('curl', ['-fsSL', '-o', archive, FONT_URL]);
  run('unzip', ['-o', '-j', archive, 'fonts/ttf/*.ttf', '-d', paths.fonts]);
  rmSync(archive, { force: true });
}

function fontconfig() {
  const file = path.join(paths.fontconfig, 'fonts.conf');
  mkdirSync(paths.fontconfig, { recursive: true });
  writeFileSync(
    file,
    [
      '<?xml version="1.0"?>',
      '<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">',
      '<fontconfig>',
      `  <dir>${paths.fonts}</dir>`,
      `  <cachedir>${path.join(paths.fontconfig, 'cache')}</cachedir>`,
      '  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>',
      '</fontconfig>',
      '',
    ].join('\n'),
  );
  return file;
}

/* ----------------------------------------------------------------- workspace */

/* The copy is what a tape is allowed to destroy: nothing here is the demo app. */
function prepareWorkspace(beat) {
  const scene = beat.scene;
  const base = path.join(WORKSPACES, beat.id);
  const from = String(scene.workspace ?? 'app').replace(/^from:/, '');

  rmSync(base, { recursive: true, force: true });
  mkdirSync(base, { recursive: true });

  if (from === 'scratch') {
    writeFileSync(path.join(base, '.vhs-env'), SHELL_ENV);
    return base;
  }

  /* `from:<beat>` picks up where an earlier beat left the shell, which is how a
     series continues a story instead of resetting it between sentences. */
  const source =
    from === String(scene.workspace ?? 'app') ? paths.workspace : path.join(WORKSPACES, from);
  if (!existsSync(source)) {
    die(`${beat.id}: no workspace ${path.relative(root, source)} — render ${from} first`);
  }

  cpSync(source, base, {
    recursive: true,
    filter: (entry) => !['node_modules', 'dist', '.git'].includes(path.basename(entry)),
  });

  /* Resolving from the demo's own install keeps the tape off the network and in
     the same dependency state the rest of the episode uses. */
  symlinkSync(path.join(paths.workspace, 'node_modules'), path.join(base, 'node_modules'));

  for (const entry of scene.reset ?? []) {
    rmSync(path.join(base, entry), { recursive: true, force: true });
  }

  writeFileSync(path.join(base, '.vhs-env'), SHELL_ENV);

  return base;
}

/* --------------------------------------------------------------------- tape */

/**
 * How long each command really takes here.
 *
 * VHS can wait for a string on screen, but a transcript's lines are one run's
 * output and a short token like `Done in` also matches the previous step. So the
 * tape is paced by measurement instead: run the steps once in a throwaway copy,
 * time them, and sleep for the result. The probe also proves the transcript
 * still works before anything is filmed.
 */
function measure(beat, workspace) {
  const scene = beat.scene;
  const probe = `${workspace}.probe`;
  rmSync(probe, { recursive: true, force: true });
  cpSync(workspace, probe, {
    recursive: true,
    filter: (entry) =>
      !['node_modules', 'dist', '.git', '.beat.tape'].includes(path.basename(entry)),
  });
  symlinkSync(path.join(paths.workspace, 'node_modules'), path.join(probe, 'node_modules'));

  const transcript = JSON.parse(readFileSync(path.join(paths.logs, `${scene.log}.json`), 'utf8'));
  /* One shell, in the order the tape types, because a live session carries its
     working directory from one command to the next. */
  const script = ['set +e', 'exec 2>&1'];
  transcript.steps.forEach((step, index) => {
    if (skipped(scene, index)) return;
    script.push(
      'start=$(date +%s%N)',
      step.cmd,
      'code=$?',
      'end=$(date +%s%N)',
      `echo "TIMING ${index} $(( (end-start)/1000000 )) $code"`,
    );
  });
  script.push('exit 0');

  const result = spawnCapture('bash', ['-c', script.join('\n')], { cwd: probe });
  const timings = [];
  const failures = [];

  for (const line of result.stdout.split('\n')) {
    const match = /^TIMING (\d+) (\d+) (\d+)$/.exec(line.trim());
    if (!match) continue;
    timings[Number(match[1])] = Number(match[2]);
    if (match[3] !== '0') failures.push(Number(match[1]));
  }

  rmSync(probe, { recursive: true, force: true });

  const missing = transcript.steps.findIndex(
    (_, index) => !skipped(scene, index) && timings[index] === undefined,
  );
  if (missing !== -1) {
    die(
      `${beat.id}: could not time step ${missing + 1}\n${result.stdout}\n${result.stderr}`.trim(),
    );
  }
  if (failures.length) {
    die(
      `${beat.id}: the transcript no longer succeeds at step ` +
        `${failures.map((index) => index + 1).join(', ')} — fix the transcript before filming\n` +
        result.stdout.split('\n').slice(-25).join('\n').trim(),
    );
  }

  const stuck = STUCK.find((banner) => result.stdout.includes(banner));
  if (stuck) {
    die(
      `${beat.id}: the transcript opened a full-screen program (${JSON.stringify(stuck)}). ` +
        'Add a pager flag to the command or drop the step.',
    );
  }

  return timings;
}

/** A step the video does not film: it exists for the article, not the screen. */
function skipped(scene, index) {
  return (scene.skip ?? []).map(Number).includes(index);
}

function quote(text) {
  return `"${text.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

/**
 * Pacing comes from the narration, not from a constant: typing takes a little
 * under half the beat, and the rest is reading time, distributed over the steps.
 */
function tape(beat, workspace, timings) {
  const scene = beat.scene;
  const transcript = JSON.parse(readFileSync(path.join(paths.logs, `${scene.log}.json`), 'utf8'));
  const duration = durations.get(beat.id);
  if (!duration) die(`no audio for ${beat.id} — run voice.mjs first`);

  const startup = 0.5;
  /* Land a hair short of the narration: a clip that is cut is worse than a
     quarter second of quiet at the end. */
  const margin = 0.25;
  /* The commands' real runtime is spent no matter what; what is left over is
     reading time, shared evenly so the beat ends with its narration. */
  const characters = transcript.steps
    .filter((_, index) => !skipped(scene, index))
    .reduce((sum, step) => sum + step.cmd.length + 1, 0);
  const filmed = transcript.steps.filter((_, index) => !skipped(scene, index));
  const runtime = timings.reduce((sum, ms) => sum + ms, 0);
  const settleMs = 250;
  const budget = (duration - startup - margin) * 1000 - runtime - filmed.length * settleMs;
  const typingMs = Math.round(Math.min(90, Math.max(16, budget / 2 / characters)));
  const reading = Math.max(0, (budget - characters * typingMs) / filmed.length);

  const lines = [
    `Output ${quote(`${beat.id}.mp4`)}`,
    `Set Shell ${SHELL}`,
    'Set FontFamily "JetBrains Mono"',
    'Set FontSize 18',
    `Set Width ${TERMINAL.width}`,
    `Set Height ${TERMINAL.height}`,
    'Set Padding 0',
    'Set WindowBar Colorful',
    `Set Theme ${quote(THEME)}`,
    'Set Framerate 30',
    'Set PlaybackSpeed 1',
    `Set TypingSpeed ${typingMs}ms`,
    /* The prompt check runs after the measured runtime; this is the grace for a
       cold page cache, not the command's own duration. */
    'Set WaitTimeout 20s',
    '',
    '# A prompt with no machine in it, no pager, and no history from the profile.',
    'Hide',
    `Type ${quote('source .vhs-env')}`,
    'Enter',
    `Type ${quote('clear')}`,
    'Enter',
    'Show',
  ];

  transcript.steps.forEach((step, index) => {
    if (skipped(scene, index)) return;

    lines.push(`Type ${quote(step.cmd)}`, 'Enter');

    /* The measurement is a lower bound: a cold cache or a slow disk may take
       longer, and a command typed over is worse than a second of stillness. */
    const settle = Math.round(Math.max(200, (timings[index] ?? 0) * 1.1 + settleMs + reading));

    lines.push(`Sleep ${settle}ms`);
    /* A returned prompt is the only proof the command actually finished. The
       pattern matches a screen line that is exactly the prompt, not the echoed
       `$ command` line, and `(?m)` makes the anchors per-line. */
    lines.push('Wait+Screen /(?m)^\$$/');
  });

  return { transcript, tape: `${lines.join('\n')}\n` };
}

/* -------------------------------------------------------------------- record */

const vhs = ensureTools();
ensureFonts();
const fontconfigFile = fontconfig();
mkdirSync(paths.terminals, { recursive: true });

for (const beat of beats) {
  const duration = durations.get(beat.id);
  const workspace = prepareWorkspace(beat);
  const timings = measure(beat, workspace);
  const { tape: script } = tape(beat, workspace, timings);

  const tapePath = path.join(workspace, '.beat.tape');
  writeFileSync(tapePath, script);

  process.stdout.write(`\n${beat.id}  ${duration.toFixed(1)}s  (${beat.scene.log})\n`);

  const result = spawnCapture(vhs, ['--quiet', tapePath], {
    cwd: workspace,
    env: { FONTCONFIG_FILE: fontconfigFile },
  });

  if (result.status !== 0) {
    const hint = result.stderr.includes('timeout waiting for')
      ? '\nthe shell never returned to a prompt — a pager or an interactive command held it.'
      : '';
    die(`${beat.id}: vhs failed${hint}\n${result.stdout}\n${result.stderr}`.trim());
  }

  const rendered = path.join(workspace, `${beat.id}.mp4`);
  if (!existsSync(rendered)) die(`${beat.id}: vhs wrote no clip`);

  const target = path.join(paths.terminals, `${beat.id}.mp4`);
  /* The workspaces are on another filesystem, so this cannot be a rename. */
  copyFileSync(rendered, target);

  const probe = JSON.parse(
    run('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration:stream=width,height',
      '-of',
      'json',
      target,
    ]),
  );
  const length = Number(probe.format.duration);
  const size = probe.streams[0];

  if (size.width !== TERMINAL.width || size.height !== TERMINAL.height) {
    die(
      `${beat.id}: expected ${TERMINAL.width}x${TERMINAL.height}, got ${size.width}x${size.height}`,
    );
  }

  /* A session longer than its narration is cut mid-output by the assembler,
     which is the one way this can look wrong. */
  if (length > duration + 0.2) {
    log(
      `  warning: the tape runs ${length.toFixed(1)}s but its narration is ${duration.toFixed(1)}s ` +
        `— trim the transcript or lengthen the beat`,
    );
  }

  log(`  clip ${path.relative(root, target)}  ${size.width}x${size.height}  ${length.toFixed(2)}s`);
}

log(
  `\n${beats.length} terminal clip${beats.length === 1 ? '' : 's'} in ${path.relative(root, paths.terminals)}`,
);
