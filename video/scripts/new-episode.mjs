/**
 * Turns an article into a draft beat sheet.
 *
 * It reads the markdown the way the series is written: an H1, an intro, one
 * `##` section per idea, figures that already exist, and code blocks that are
 * *not* read aloud. The output is a skeleton to rewrite, not a finished script -
 * condensing is editorial work and this only removes the blank page.
 *
 *   node video/scripts/new-episode.mjs --article articles/02-sixty-three-components-one-rulebook.md
 *   node video/scripts/new-episode.mjs --article articles/03-two-formats-one-tarball.md --id 03-tarball
 */
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { die, log, parseArgs, paths, root } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.article) die('--article <path.md> is required');

const articlePath = path.isAbsolute(args.article) ? args.article : path.join(root, args.article);
if (!existsSync(articlePath)) die(`no article at ${args.article}`);

const markdown = (await import('node:fs')).readFileSync(articlePath, 'utf8');

/** Frontmatter is `key: value` up to the closing `---`; enough for a draft. */
function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const out = {};
  for (const line of match[1].split('\n')) {
    const entry = line.match(/^([a-z-]+):\s*(.*)$/i);
    if (entry) out[entry[1]] = entry[2].replace(/^['"]|['"]$/g, '');
  }
  return out;
}

/** Prose only: no code, no figure markup, no emphasis markers. */
function prose(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentences(text, count) {
  return text
    .split(/(?<=[.!?])\s+/)
    .slice(0, count)
    .join(' ')
    .trim();
}

const meta = frontmatter(markdown);
const body = markdown.replace(/^---\n[\s\S]*?\n---/, '');
const h1 = body.match(/^#\s+(.+)$/m)?.[1] ?? 'untitled';

/* Sections, with the raw slice each one owns. */
const sections = [];
const heading = /^##\s+(.+)$/gm;
let match;

while ((match = heading.exec(body))) {
  const start = match.index + match[0].length;
  const next = body.slice(start).search(/^##\s+/m);
  sections.push({
    title: match[1].replace(/[*_`]/g, '').trim(),
    text: body.slice(start, next === -1 ? undefined : start + next),
  });
}

const slug = (args.id ?? path.basename(articlePath, '.md'))
  .replace(/[^a-z0-9-]/gi, '-')
  .toLowerCase();

/** A scene per section, chosen from what the section actually contains. */
function sceneFor(text) {
  const figure = text.match(/!\[[^\]]*\]\((?:\.\/)?images\/([a-z0-9-]+)\.png\)/);
  const file = text.match(/`((?:src|scripts)\/[A-Za-z0-9._/-]+\.[a-z]+)`/);
  const command = text.match(/```(?:sh|bash)\n([\s\S]*?)```/);

  if (figure) return { type: 'figure', figure: figure[1], steps: [] };
  if (command) return { type: 'terminal', title: 'terminal', log: slug };
  if (file) return { type: 'ide', file: file[1], lines: ['/* TODO: the lines worth typing */'] };

  return { type: 'cards', kicker: 'TODO', title: 'TODO', cards: [] };
}

const beats = [];

beats.push({
  id: '01-cold-open',
  caption: h1,
  narration: `${sentences(prose(meta.description ?? ''), 2) || 'TODO: the opening line.'}`,
  scene: { type: 'figure', figure: `${slug.split('-')[0]}-cover`, steps: [] },
});

sections.forEach((section, index) => {
  const id = `${String(index + 2).padStart(2, '0')}-${section.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 28)
    .replace(/-+$/, '')}`;

  beats.push({
    id,
    caption: section.title,
    narration: sentences(prose(section.text), 3) || 'TODO: condense this section.',
    scene: sceneFor(section.text),
  });
});

beats.push({
  id: `${String(beats.length + 1).padStart(2, '0')}-outro`,
  caption: 'Outro',
  narration: 'TODO: the payoff, and where the next part goes.',
  scene: { type: 'figure', figure: `${slug.split('-')[0]}-cover`, steps: [] },
});

const episode = {
  id: slug,
  title: h1,
  subtitle: 'Draft from article',
  output: slug,
  article: path.relative(root, articlePath),
  voice: 'am_michael',
  speed: 0.98,
  fps: 30,
  size: [1920, 1080],
  tail: 0.45,
  draft: true,
  beats,
};

const out = path.join(paths.episodes, `${slug}.json`);
writeFileSync(out, `${JSON.stringify(episode, null, 2)}\n`);

const words = beats.reduce((sum, beat) => sum + beat.narration.split(/\s+/).length, 0);
log(`draft beat sheet: ${path.relative(root, out)}`);
log(`  ${beats.length} beats · ${words} words of source prose (condense to ~850)`);
log('  rewrite the narration, keep the ids, then: cli.mjs voice --episode ' + slug);
