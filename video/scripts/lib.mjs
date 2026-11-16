/**
 * Shared paths and argument parsing for the video pipeline.
 *
 * Every script is invoked as `node video/scripts/<stage>.mjs --episode <id>`,
 * so the episode is always data, never a hardcoded file name.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

export const root = path.resolve(import.meta.dirname, '../..');
export const paths = {
  root,
  video: path.join(root, 'video'),
  episodes: path.join(root, 'video/episodes'),
  stage: path.join(root, 'video/stage'),
  docs: path.join(root, 'video/docs'),
  build: path.join(root, 'video/build'),
  audio: path.join(root, 'video/build/audio'),
  clips: path.join(root, 'video/build/clips'),
  frames: path.join(root, 'video/build/frames'),
  workspace: path.join(root, 'video/build/palette-demo'),
  logs: path.join(root, 'video/build/logs'),
  hfCache: path.join(root, 'video/build/hf-cache'),
  out: path.join(root, 'video/out'),
  articles: path.join(root, 'articles'),
  figures: path.join(root, 'articles/images'),
  storybook: path.join(root, 'video/build/storybook'),
};

export const log = (message = '') => process.stdout.write(`${message}\n`);

export function die(message) {
  process.stderr.write(`\n${message}\n`);
  process.exit(1);
}

/** `--key value`, `--flag`. Episode ids are positional-safe: `--episode 01-palette`. */
export function parseArgs(argv) {
  const out = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const key = token.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const next = argv[i + 1];

    if (next === undefined || next.startsWith('--')) out[key] = true;
    else {
      out[key] = next;
      i += 1;
    }
  }

  return out;
}

/**
 * Loads an episode by id (`01-palette`) or by its file name, and fails loudly
 * with the list of known episodes rather than with an ENOENT.
 */
export function readEpisode(id) {
  if (!id) die(`--episode is required. Known: ${episodeIds().join(', ')}`);

  const candidates = [path.join(paths.episodes, `${id}.json`), path.join(paths.episodes, id)];
  const file = candidates.find((candidate) => existsSync(candidate));

  if (!file) die(`no episode "${id}". Known: ${episodeIds().join(', ')}`);
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function episodeIds() {
  if (!existsSync(paths.episodes)) return [];
  return readdirSync(paths.episodes)
    .filter((file) => file.endsWith('.json') && !file.startsWith('_'))
    .map((file) => file.replace(/\.json$/, ''));
}

export function readTimeline() {
  const file = path.join(paths.build, 'timeline.json');
  if (!existsSync(file)) {
    die('no video/build/timeline.json — run `node video/scripts/voice.mjs --episode <id>` first');
  }
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** Runs a command, returning stdout, and fails with its output rather than a stack. */
export function run(command, args, options = {}) {
  const result = spawnCapture(command, args, options);
  if (result.status !== 0) {
    die(`command failed: ${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`.trim());
  }
  return result.stdout;
}

function spawnCapture(command, args, { cwd = root, env = {} } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

export { spawnCapture };

/** Polls a URL until it answers, or fails after `timeout` ms. */
export async function waitForHttp(url, { timeout = 60_000, interval = 250 } = {}) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.ok || response.status < 500) return response;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  die(`timed out waiting for ${url}`);
}

/** An unused port, so a running Storybook on :6006 is never fought over. */
export async function freePort(preferred) {
  const net = await import('node:net');

  const tryPort = (port) =>
    new Promise((resolve) => {
      const server = net.createServer();
      server.unref();
      server.once('error', () => resolve(false));
      server.listen(port, '127.0.0.1', () => server.close(() => resolve(true)));
    });

  for (let port = preferred; port < preferred + 40; port += 1) {
    if (await tryPort(port)) return port;
  }

  die(`no free port near ${preferred}`);
}
