/**
 * One entry point for the whole pipeline.
 *
 *   node video/scripts/cli.mjs sandbox                  # build the demo app + transcripts
 *   node video/scripts/cli.mjs audition                 # first beat, in one voice
 *   node video/scripts/cli.mjs voice   --episode 01-palette
 *   node video/scripts/cli.mjs record  --episode 01-palette [--only 05-unlayered]
 *   node video/scripts/cli.mjs assemble --episode 01-palette
 *   node video/scripts/cli.mjs all     --episode 01-palette
 *   node video/scripts/cli.mjs serve   --episode 01-palette   # look at a beat
 *   node video/scripts/cli.mjs new --article articles/02-...md
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { episodeIds, log, parseArgs, root } from './lib.mjs';

const [command] = process.argv.slice(2);
const args = process.argv.slice(2).slice(1);

const episodeId = parseArgs(args).episode ?? episodeIds()[0];

const STAGES = {
  sandbox: ['sandbox.mjs', () => args],
  audition: ['voice.mjs', () => ['--audition', ...episodeArgs()]],
  voice: ['voice.mjs', () => episodeArgs()],
  record: ['record.mjs', () => episodeArgs()],
  assemble: ['assemble.mjs', () => episodeArgs()],
  serve: ['serve.mjs', () => episodeArgs()],
  new: ['new-episode.mjs', () => args],
};

function episodeArgs() {
  /* Strip --only / --fresh / tunables that belong to one stage, keep the rest. */
  return args.length ? args : episodeId ? ['--episode', episodeId] : [];
}

function run(script, argv) {
  const child = spawnSync(process.execPath, [path.join(import.meta.dirname, script), ...argv], {
    cwd: root,
    stdio: 'inherit',
  });
  if (child.status !== 0) process.exit(child.status ?? 1);
}

if (command === 'all') {
  log('\n== 1/3 voice\n');
  run('voice.mjs', episodeArgs());
  log('\n== 2/3 record\n');
  run('record.mjs', episodeArgs());
  log('\n== 3/3 assemble\n');
  run('assemble.mjs', episodeArgs());
} else if (STAGES[command]) {
  const [script, argv] = STAGES[command];
  run(script, argv());
} else {
  log(
    [
      'usage: node video/scripts/cli.mjs <command> [--episode <id>] [flags]',
      '',
      '  sandbox    build the demo app and the terminal transcripts',
      '  audition   the first beat in one voice (--voice am_onyx)',
      '  voice      synthesise narration for every beat',
      '  record     record one clip per beat',
      '  assemble   cut, concat, mux and caption the final video',
      '  all        voice, record, assemble',
      '  serve      serve the stage for manual inspection',
      '  new        draft a beat sheet from an article',
    ].join('\n'),
  );
  process.exit(command ? 1 : 0);
}
