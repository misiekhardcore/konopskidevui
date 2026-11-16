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

import { die, episodeIds, log, parseArgs, paths, readEpisode, readTimeline } from './lib.mjs';
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

const SCENES = ['figure', 'cards', 'terminal', 'ide', 'ide-split', 'preview'];

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
    if (['ide', 'ide-split'].includes(scene.type)) {
      if (!scene.file) problems.push('no file');
      if (!scene.lines?.length) problems.push('no lines');
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
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      recordVideo: { dir: paths.clips, size: { width: 1920, height: 1080 } },
    });

    const startedAt = Date.now();
    const page = await context.newPage();

    await page.goto(
      `${servers.url}/?beat=${encodeURIComponent(beat.id)}&duration=${target}&episode=${episode.id}`,
      { waitUntil: 'domcontentloaded' },
    );

    await page.waitForFunction('window.__STAGE_READY === true', null, { timeout: 45_000 });
    const head = Number(((Date.now() - startedAt) / 1000).toFixed(3));

    await page.waitForFunction('window.__STAGE_DONE === true', null, {
      timeout: (target + 30) * 1000,
    });

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
