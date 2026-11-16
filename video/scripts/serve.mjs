/**
 * Serves everything a beat needs, from one origin:
 *
 *   /                 the stage (video/stage)
 *   /api/beat/:id     the beat, its highlighted code, its log, and the URLs
 *   /figures/*        the article figures
 *   /nm/*             node_modules, for the @fontsource typefaces
 *   /storybook/*      the real static Storybook build
 *
 * A Vite dev server for `build/palette-demo` runs alongside it on its own port,
 * so the browser pane in a beat is a live app, not a screenshot.
 *
 *   node video/scripts/serve.mjs --episode 01-palette   # inspect by hand
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { cpSync, createReadStream, existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';

import { codeToTokens } from 'shiki';

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
  waitForHttp,
} from './lib.mjs';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

function send(response, status, body, type = 'text/plain; charset=utf-8') {
  response.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  response.end(body);
}

function file(response, target) {
  if (!existsSync(target) || statSync(target).isDirectory())
    return send(response, 404, 'not found');

  response.writeHead(200, {
    'content-type': TYPES[path.extname(target)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(target).pipe(response);
}

/** Shiki tokens per line, so the stage can reveal a line without breaking it. */
async function highlight(lines) {
  const { tokens } = await codeToTokens(lines.join('\n'), { lang: 'css', theme: 'github-light' });

  return lines.map((text, index) => {
    const html = (tokens[index] ?? [])
      .map((token) => {
        const style = [
          token.color ? `color:${token.color}` : '',
          token.fontStyle & 1 ? 'font-style:italic' : '',
          token.fontStyle & 2 ? 'font-weight:700' : '',
        ]
          .filter(Boolean)
          .join(';');

        const content = token.content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return style ? `<span style="${style}">${content}</span>` : content;
      })
      .join('');

    return { text, html: html || '&nbsp;' };
  });
}

/** Storybook is 13 MB of static files; build it once and serve it here. */
function ensureStorybook() {
  if (existsSync(path.join(paths.storybook, 'index.html'))) return;

  const built = path.join(root, 'storybook-static');
  if (!existsSync(path.join(built, 'index.html'))) {
    log('building Storybook once (this is the preview for the docs beat)');
    run('pnpm', ['build:storybook'], { cwd: root });
  }

  rmSync(paths.storybook, { recursive: true, force: true });
  cpSync(built, paths.storybook, { recursive: true });
  log(`storybook copied to ${path.relative(root, paths.storybook)}`);
}

export async function startServers({ episodeId, port = 4517, previewPort = 5174 } = {}) {
  const episode = readEpisode(episodeId);
  const timeline = readTimeline();
  const durations = new Map(timeline.beats.map((beat) => [beat.id, beat.duration]));

  ensureStorybook();

  /* The app in the browser pane. Vite owns its own port; we only wait for it. */
  const preview = spawn('pnpm', ['exec', 'vite', '--port', String(previewPort), '--strictPort'], {
    cwd: paths.workspace,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });

  const viteLog = [];
  preview.stdout.on('data', (chunk) => viteLog.push(String(chunk)));
  preview.stderr.on('data', (chunk) => viteLog.push(String(chunk)));

  const previewUrl = `http://127.0.0.1:${previewPort}`;
  await waitForHttp(previewUrl, { timeout: 60_000 });

  const cache = new Map();

  async function beatPayload(id) {
    if (cache.has(id)) return cache.get(id);

    const beat = episode.beats.find((candidate) => candidate.id === id);
    if (!beat) return null;

    const scene = beat.scene;
    const payload = {
      episode: { title: episode.title, subtitle: episode.subtitle },
      beat: { id: beat.id, caption: beat.caption, scene },
      duration: durations.get(beat.id) ?? 8,
      urls: {
        preview: previewUrl,
        storybook: `http://127.0.0.1:${port}/storybook`,
      },
    };

    /* Every file a beat reveals is a stylesheet; the editor met Col 1 on CSS. */
    if (scene.lines?.length) {
      payload.code = { file: scene.file, lines: await highlight(scene.lines) };
    }

    if (scene.log) {
      const file = path.join(paths.logs, `${scene.log}.json`);
      if (!existsSync(file)) die(`no transcript ${file} — run node video/scripts/sandbox.mjs`);
      payload.log = JSON.parse(readFileSync(file, 'utf8'));
    }

    cache.set(id, payload);
    return payload;
  }

  const server = createServer(async (request, response) => {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    const route = decodeURIComponent(url.pathname);

    if (route === '/api/health') return send(response, 200, 'ok');

    if (route.startsWith('/api/beat/')) {
      const payload = await beatPayload(route.replace('/api/beat/', ''));
      if (!payload) return send(response, 404, 'no such beat');
      return send(response, 200, JSON.stringify(payload), 'application/json; charset=utf-8');
    }

    if (route.startsWith('/figures/')) {
      return file(response, path.join(paths.figures, route.replace('/figures/', '')));
    }

    if (route.startsWith('/nm/')) {
      return file(response, path.join(root, 'node_modules', route.replace('/nm/', '')));
    }

    if (route.startsWith('/storybook')) {
      const target = path.join(paths.storybook, route.replace('/storybook', '') || 'index.html');
      return file(
        response,
        existsSync(target) && statSync(target).isDirectory()
          ? path.join(target, 'index.html')
          : target,
      );
    }

    if (route === '/' || route === '/index.html') {
      return file(response, path.join(paths.stage, 'index.html'));
    }

    return file(response, path.join(paths.stage, route.slice(1)));
  });

  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

  const url = `http://127.0.0.1:${port}`;
  log(`stage   ${url}`);
  log(`preview ${previewUrl}`);
  log(`storybook ${url}/storybook`);

  return {
    url,
    previewUrl,
    async close() {
      await new Promise((resolve) => server.close(resolve));
      try {
        process.kill(-preview.pid, 'SIGTERM');
      } catch {
        preview.kill('SIGTERM');
      }
    },
  };
}

/* Standalone: keep serving so a beat can be looked at in a browser. */
if (process.argv[1] && import.meta.filename === path.resolve(process.argv[1])) {
  const args = parseArgs(process.argv.slice(2));
  const episodeId = args.episode ?? episodeIds()[0];
  if (!episodeId) die('no episodes in video/episodes');

  const servers = await startServers({
    episodeId,
    port: Number(args.port ?? 4517),
    previewPort: Number(args.previewPort ?? 5174),
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, async () => {
      await servers.close();
      process.exit(0);
    });
  }
}
