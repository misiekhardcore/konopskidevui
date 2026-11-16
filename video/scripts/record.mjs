/**
 * Records one clip per beat, at 1920x1080, in real time.
 *
 * Beats are recorded separately on purpose: each clip lasts exactly as long as
 * its own narration, measured from the audio, so nothing can drift and one bad
 * beat never costs the whole video. Loading time before the stage is ready is
 * measured and recorded as `head`, so the assembler can trim it away.
 *
 *   node video/scripts/record.mjs --episode 01-palette
 *   node video/scripts/record.mjs --episode 01-palette --only 05-unlayered
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { chromium } from 'playwright';

import {
  die,
  episodeIds,
  FRAME,
  log,
  parseArgs,
  paths,
  readEpisode,
  readTimeline,
} from './lib.mjs';
import { startServers } from './serve.mjs';

const args = parseArgs(process.argv.slice(2));
const episodeId = args.episode ?? episodeIds()[0];
if (!episodeId) die('no episodes in video/episodes');

const episode = readEpisode(episodeId);
const timeline = readTimeline();
const durations = new Map(timeline.beats.map((beat) => [beat.id, beat.duration]));

/* `--only 03,05` re-records two beats; a bare prefix matches what it starts. */
const only = args.only
  ? String(args.only)
      .split(',')
      .map((id) => id.trim())
  : null;
const beats = only
  ? episode.beats.filter((beat) => only.some((id) => beat.id === id || beat.id.startsWith(id)))
  : episode.beats;
if (beats.length === 0) die(`no beat matches --only ${args.only}`);

const SCENES = [
  'figure',
  'cards',
  'terminal',
  'preview',
  'workbench',
  'workbench-split',
  'workbench-tour',
];

/* ------------------------------------------------------------- the workbench */

/**
 * A workbench beat is film of the real VS Code web client, on its own page: no
 * iframe, which is where the previous attempt at this lost focus and keystrokes.
 * The stage's caption and progress bar are injected into that page instead, so
 * `assemble.mjs` still owns nothing but cutting and muxing.
 */
async function openWorkbench(page, servers, beat) {
  const first =
    beat.scene.type === 'workbench-tour' ? beat.scene.segments[0].file : beat.scene.file;
  const url = `${servers.workbench}/?folder=${encodeURIComponent(paths.workspace)}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.monaco-workbench .activitybar', { timeout: 90_000 });
  /* The explorer having rows is the workbench being ready to take a keystroke;
     the activity bar is painted long before that. */
  await page.waitForSelector('.explorer-folders-view .monaco-list-row', { timeout: 90_000 });
  await page.waitForTimeout(800);

  /* Opening the file goes through Quick Open, which is what a person does.
     It happens before `__STAGE_READY`, so it lands in the trimmed head. */
  await page.keyboard.press('Control+P');
  await page.waitForSelector('.quick-input-widget', { timeout: 15_000 });
  await page.keyboard.type(first, { delay: 10 });
  /* On a cold workspace the file index answers a moment after the last
     keystroke; Enter before the first result exists opens nothing. */
  await page.waitForSelector('.quick-input-list .monaco-list-row', { timeout: 20_000 });
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');

  const name = path.basename(first);
  await page.waitForSelector('.editor-group-container .monaco-editor .view-lines', {
    timeout: 30_000,
  });
  await page.waitForFunction(
    (target) => document.querySelector('.tab.active')?.textContent?.includes(target),
    name,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(400);

  if (beat.scene.type === 'workbench-split') await openPreview(page, servers, beat);
}

/**
 * A tour opens already-written files and walks them: jump to a file, put the
 * caret on the line the narration has reached, and hold. It is the scene for
 * code that is too long to type in a beat and too important to show as a still.
 */
async function tourSegment(page, segment) {
  const name = path.basename(segment.file);
  const active = await page.evaluate(
    (target) => document.querySelector('.tab.active')?.textContent?.includes(target) ?? false,
    name,
  );

  if (!active) {
    await page.keyboard.press('Control+P');
    await page.waitForSelector('.quick-input-widget', { timeout: 15_000 });
    await page.keyboard.type(segment.file, { delay: 8 });
    await page.waitForSelector('.quick-input-list .monaco-list-row', { timeout: 20_000 });
    await page.waitForTimeout(250);
    await page.keyboard.press('Enter');
    await page.waitForFunction(
      (target) => document.querySelector('.tab.active')?.textContent?.includes(target),
      name,
      { timeout: 30_000 },
    );
  }  /* Quick Open leaves the caret in the editor, and a same-file segment never
     moved it, so no click is needed - and a click has to hit a position on
     screen, which the chrome overlay can get in the way of. */

  /* Go To Line is the only way to land on a section in a file of any length
     without depending on the scroll position the previous segment left. The
     narration points at the block; the camera does not select it, because a
     selection reads as editing and this beat is a read-through. */
  const [from] = segment.lines;
  await page.keyboard.press('Control+G');
  await page.waitForSelector('.quick-input-widget', { timeout: 15_000 });
  await page.keyboard.type(String(from), { delay: 20 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(450);
}

/** Applies the tour's segments on the recording's clock. */
function scheduleTour(page, beat, target) {
  const timers = (beat.scene.segments ?? []).map((segment, index) =>
    setTimeout(
      () => {
        tourSegment(page, segment).catch((error) =>
          log(`  warning: tour segment ${index + 1} failed: ${error.message}`),
        );
      },
      Math.max(0, (segment.at ?? 0) * target * 1000),
    ),
  );

  return () => timers.forEach(clearTimeout);
}

/**
 * The app beside the code, using VS Code's own Simple Browser: a real webview,
 * on a real dev server, in the real workbench. No mock pane is involved.
 */
async function openPreview(page, servers, beat) {
  await page.keyboard.press('Control+Backslash');
  await page.waitForTimeout(500);

  await page.keyboard.press('Control+Shift+P');
  await page.waitForSelector('.quick-input-widget', { timeout: 15_000 });
  await page.keyboard.type('Simple Browser: Show', { delay: 10 });
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  await page.keyboard.type(servers.previewUrl, { delay: 6 });
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const frame = previewFrame(page, servers);
    if (frame) break;
    await page.waitForTimeout(250);
  }
  if (!previewFrame(page, servers))
    die(`${beat.id}: the Simple Browser never loaded ${servers.previewUrl}`);

  /* The pane gets a third of the frame in the stage's split; the same here. */
  await page.waitForTimeout(1500);
}

function previewFrame(page, servers) {
  return page.frames().find((frame) => frame.url().startsWith(servers.previewUrl));
}

/** Applies a beat's timed events to the preview, on the recording's clock. */
function schedulePreview(page, servers, beat, target) {
  const scene = beat.scene;
  const timers = [];

  if (scene.themeAt) {
    timers.push(
      setTimeout(
        () => {
          const frame = previewFrame(page, servers);
          frame
            ?.evaluate(() => document.documentElement.classList.add('dark'))
            .catch((error) => log(`  warning: theme flip failed: ${error.message}`));
        },
        scene.themeAt * target * 1000,
      ),
    );
  }

  if (scene.scrollTo) {
    timers.push(
      setTimeout(
        () => {
          const frame = previewFrame(page, servers);
          frame
            ?.evaluate(
              (share) => window.scrollTo({ top: document.body.scrollHeight * share }),
              scene.scrollTo,
            )
            .catch((error) => log(`  warning: scroll failed: ${error.message}`));
        },
        scene.scrollTo * target * 1000,
      ),
    );
  }

  return () => timers.forEach(clearTimeout);
}

/** The caption strip, the progress bar, and the clock the whole beat keeps. */
async function drawChrome(page, servers, beat, target) {
  await page.addStyleTag({ path: path.join(paths.stage, 'overlay.css') });
  await page.addStyleTag({
    /* A film band above the workbench for the caption, in place of the web
       client's browser-ish title bar. Everything under it is the real editor. */
    content: [
      '.monaco-workbench .part.titlebar { display: none !important; }',
      'html, body { background: #fbfbfa !important; }',
      '.monaco-workbench { position: relative !important; top: 46px !important; ' +
        'height: calc(100vh - 46px) !important; }',
    ].join('\n'),
  });
  await page.addStyleTag({
    content: ['400', '700']
      .map(
        (weight) =>
          `@font-face{font-family:'Lato';font-style:normal;font-weight:${weight};` +
          `src:url('${servers.url}/nm/@fontsource/lato/files/lato-latin-${weight}-normal.woff2') ` +
          `format('woff2')}`,
      )
      .join('\n'),
  });

  await page.evaluate(
    ({ caption, series, duration }) => {
      const chrome = document.createElement('div');
      chrome.id = 'video-chrome';
      chrome.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';

      const captionEl = document.createElement('div');
      captionEl.id = 'caption';
      captionEl.innerHTML = `<span class="series"></span><span></span>`;
      captionEl.querySelector('.series').textContent = series;
      captionEl.lastChild.textContent = caption;

      const progressEl = document.createElement('div');
      progressEl.id = 'progress';
      chrome.append(captionEl, progressEl);
      document.body.append(chrome);

      const startedAt = performance.now();
      const tick = () => {
        const elapsed = performance.now() - startedAt;
        progressEl.style.width = `${Math.min(100, (elapsed / (duration * 1000)) * 100)}%`;
        if (elapsed >= duration * 1000) {
          window.__STAGE_DONE = true;
          return;
        }
        requestAnimationFrame(tick);
      };

      requestAnimationFrame(() => {
        captionEl.classList.add('on');
        window.__STAGE_READY = true;
        requestAnimationFrame(tick);
      });
    },
    { caption: beat.caption, series: episode.subtitle ?? '', duration: target },
  );
}

/**
 * `prefill` means the beat types an addition to an existing file: everything
 * before the first typed line is already there when the clip starts.
 *
 * The seed comes from the repository's copy, not the demo app's: the beat sheet
 * quotes the repo, and a recorded beat leaves the demo's copy edited until it is
 * put back.
 */
function seedFor(beat) {
  const scene = beat.scene;
  if (!scene.prefill) return '';

  const source = path.join(paths.root, scene.file);
  if (!existsSync(source)) die(`${beat.id}: ${scene.file} is not in the repository`);

  const lines = readFileSync(source, 'utf8').split('\n');
  const at = lines.indexOf(scene.lines[0]);
  if (at === -1) {
    die(`${beat.id}: prefill cannot find "${scene.lines[0]}" in ${scene.file}`);
  }

  /* The trailing newline is what puts the caret on a fresh line: without it the
     first typed line lands on the end of the seed's last line. */
  return `${lines.slice(0, at).join('\n')}\n`;
}

/** What the file must contain once the beat has finished typing it. */
function expected(beat, seed) {
  return `${seed}${(beat.scene.lines ?? []).join('\n')}`;
}

async function typeLines(page, beat, target, seed, file) {
  const scene = beat.scene;
  const text = (scene.lines ?? []).join('\n');

  /* Control+1 focuses the first editor group, which matters after a Simple
     Browser took the focus. Control+End then puts the caret at the end of what
     was prefilled. A click is avoided on purpose: a click is a position on
     screen, and the recording would depend on that position being free. */
  /* The editor has to own the keyboard: a Simple Browser pane takes the focus
     when it opens, and a beat that types into a webview writes nothing. */
  await page
    .locator('.editor-group-container .monaco-editor .view-lines')
    .first()
    .click({ position: { x: 6, y: 8 } });
  await page.keyboard.press('Control+End');

  /* Typing owns just over half the beat; the rest is the file being read. */
  const delay = Math.round(
    Math.min(70, Math.max(10, ((target * 0.55 * 1000) / Math.max(1, text.length)) * 1)),
  );
  const startedAt = Date.now();

  for (const [index, line] of (scene.lines ?? []).entries()) {
    if (index > 0) await page.keyboard.press('Enter');
    if (line) await page.keyboard.type(line, { delay });
  }

  const spent = (Date.now() - startedAt) / 1000;
  if (spent > target * 0.9) {
    log(`  warning: typing took ${spent.toFixed(1)}s of a ${target.toFixed(1)}s beat`);
  }

  await page.keyboard.press('Control+S');
  await page.waitForTimeout(400);

  const wanted = expected(beat, seed);
  const written = readFileSync(file, 'utf8');
  if (written !== wanted) {
    const line = wanted.split('\n').findIndex((text, index) => text !== written.split('\n')[index]);
    die(
      `${beat.id}: the workbench did not end up with the beat sheet's file ` +
        `(first difference at line ${line + 1})\n` +
        `  wanted: ${JSON.stringify(wanted.split('\n')[line])}\n` +
        `  wrote:  ${JSON.stringify(written.split('\n')[line])}`,
    );
  }
}

/** `--dry-run` proves the beat sheet is renderable without recording anything. */
if (args.dryRun) {
  let failures = 0;

  for (const beat of episode.beats) {
    const problems = [];
    const scene = beat.scene ?? {};
    const duration = durations.get(beat.id);

    if (!beat.narration?.trim()) problems.push('empty narration');
    if (!beat.caption?.trim()) problems.push('empty caption');
    if (!SCENES.includes(scene.type)) problems.push(`unknown scene type ${scene.type}`);
    if (!duration) problems.push('no audio — run voice.mjs');
    if (scene.type === 'figure' && !existsSync(path.join(paths.figures, `${scene.figure}.png`))) {
      problems.push(`missing figure ${scene.figure}.png`);
    }
    if (scene.type === 'terminal' && !existsSync(path.join(paths.logs, `${scene.log}.json`))) {
      problems.push(`missing transcript ${scene.log}.json`);
    }
    if (scene.type === 'workbench-tour') {
      if (!scene.segments?.length) problems.push('no segments');

      for (const segment of scene.segments ?? []) {
        if (!segment.file) {
          problems.push('segment without a file');
          continue;
        }
        if (!Array.isArray(segment.lines) || segment.lines.length !== 2) {
          problems.push(`${segment.file}: bad line range`);
          continue;
        }

        const file = path.join(paths.workspace, segment.file);
        if (!existsSync(file)) {
          problems.push(`no ${segment.file} in the demo app`);
          continue;
        }

        const count = readFileSync(file, 'utf8').split('\n').length;
        if (
          segment.lines[0] < 1 ||
          segment.lines[1] > count ||
          segment.lines[0] > segment.lines[1]
        ) {
          problems.push(`${segment.file}: lines ${segment.lines.join('-')} of ${count}`);
        }
      }
    } else if (scene.type.startsWith('workbench')) {
      if (!scene.file) problems.push('no file');
      if (!scene.lines?.length) problems.push('no lines');

      const file = path.join(paths.workspace, scene.file ?? '');
      if (!existsSync(file)) problems.push(`no ${scene.file} in the demo app`);
      else if (scene.prefill) {
        const source = path.join(paths.root, scene.file);
        if (!existsSync(source) || !readFileSync(source, 'utf8').includes(scene.lines[0])) {
          problems.push(`prefill anchor not in ${scene.file}`);
        }
      }
    }
    if (scene.type === 'preview' && !scene.path) problems.push('no path');

    failures += problems.length;
    log(
      `${problems.length ? 'FAIL' : ' ok '}  ${beat.id.padEnd(22)} ` +
        `${String(scene.type ?? '—').padEnd(10)} ${(duration ?? 0).toFixed(1)}s` +
        `${problems.length ? `  ${problems.join(', ')}` : ''}`,
    );
  }

  const total = timeline.beats.reduce((sum, beat) => sum + beat.duration, 0);
  const verdict = failures ? 'with problems' : 'ready to record';
  log(`\n${episode.beats.length} beats · ${Math.round(total)}s · ${verdict}`);
  process.exit(failures ? 1 : 0);
}

mkdirSync(paths.clips, { recursive: true });

const servers = await startServers({
  episodeId,
  port: Number(args.port ?? 4517),
  previewPort: Number(args.previewPort ?? 5174),
});

const browser = await chromium.launch({
  args: ['--force-device-scale-factor=1', '--hide-scrollbars', '--font-render-hinting=none'],
});

const manifestPath = path.join(paths.build, 'clips.json');
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8'))
  : { episode: episode.id, clips: [] };

try {
  for (const beat of beats) {
    const duration = durations.get(beat.id);
    if (!duration) die(`no audio duration for ${beat.id} — run voice.mjs first`);

    /* The outro tail belongs to the episode's final beat, not to whatever beat
       happens to be last in a `--only` run. */
    const lastInEpisode = episode.beats.at(-1);
    const isLast = beat === lastInEpisode;
    const tail = isLast ? (episode.tail ?? 0.4) : 0;
    const target = Number((duration + tail).toFixed(3));

    process.stdout.write(`\n${beat.id}  ${target}s  (${beat.scene.type})\n`);

    const context = await browser.newContext({
      viewport: { width: FRAME.width, height: FRAME.height },
      deviceScaleFactor: 1,
      recordVideo: {
        dir: paths.clips,
        size: { width: FRAME.width, height: FRAME.height },
      },
    });

    const startedAt = Date.now();
    const page = await context.newPage();
    const isWorkbench = beat.scene.type.startsWith('workbench');
    const isTyping = beat.scene.type === 'workbench' || beat.scene.type === 'workbench-split';
    let restore = null;
    let typed = null;
    let head = 0;
    const stopTimers = [];

    try {
      if (isWorkbench) {
        if (isTyping) {
          const file = path.join(paths.workspace, beat.scene.file);
          const seed = seedFor(beat);
          restore = { file, content: existsSync(file) ? readFileSync(file, 'utf8') : '' };

          /* The file is emptied of everything the beat is about to type, so the
             clip shows the typing rather than a file that is already finished. */
          writeFileSync(file, seed);
          typed = { seed, file };
        }

        await openWorkbench(page, servers, beat);
        await drawChrome(page, servers, beat, target);
      } else {
        await page.goto(
          `${servers.url}/?beat=${encodeURIComponent(beat.id)}&duration=${target}&episode=${episode.id}`,
          { waitUntil: 'domcontentloaded' },
        );
      }

      await page.waitForFunction('window.__STAGE_READY === true', null, { timeout: 90_000 });
      head = Number(((Date.now() - startedAt) / 1000).toFixed(3));

      /* The timers have to outlive this block: a workbench beat's events and a
         tour's jumps fire across the whole clip, not before the first await. */
      stopTimers.push(
        ...(isWorkbench ? [schedulePreview(page, servers, beat, target)] : []),
        ...(beat.scene.type === 'workbench-tour' ? [scheduleTour(page, beat, target)] : []),
      );

      if (isTyping) await typeLines(page, beat, target, typed.seed, typed.file);

      await page.waitForFunction('window.__STAGE_DONE === true', null, {
        timeout: (target + 30) * 1000,
      });
    } finally {
      for (const stop of stopTimers) stop();
      /* The demo app is a live server: leaving a half-typed stylesheet on disk
         would change every beat recorded after this one. */
      if (restore) writeFileSync(restore.file, restore.content);
    }

    const video = page.video();
    await context.close();
    if (!video) die(`no video for ${beat.id}`);

    const file = path.join(paths.clips, `${beat.id}.webm`);
    rmSync(file, { force: true });
    await video.saveAs(file);

    /* saveAs copies; the context's own `page@<hash>.webm` is left behind. */
    for (const leftover of readdirSync(paths.clips)) {
      if (leftover.startsWith('page@')) rmSync(path.join(paths.clips, leftover), { force: true });
    }

    manifest.clips = manifest.clips.filter((clip) => clip.id !== beat.id);
    manifest.clips.push({
      id: beat.id,
      file: path.relative(paths.root, file),
      head,
      duration: target,
    });
    manifest.clips.sort((a, b) => (a.id < b.id ? -1 : 1));
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    log(`  clip ${path.relative(paths.root, file)}  head ${head}s`);
    if (isLast && args.keepAlive) {
      log('  (last beat: leaving the browser open for inspection)');
    }
  }
} finally {
  await browser.close();
  await servers.close();
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
log(`\n${manifest.clips.length} clips in ${path.relative(paths.root, paths.clips)}`);
