/**
 * Runs the real VS Code workbench (code-server) for the beats that show an editor.
 *
 * Nothing about the workbench is a drawing: this is code-server's own web
 * client, served by its own process, edited by real keystrokes. The profile in
 * video/vscode is copied in on every start so the recording cannot drift with
 * whatever a previous run left behind.
 *
 * It listens on loopback only, with authentication off: it is a real shell on
 * this machine, and it must never leave 127.0.0.1.
 */
import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { die, log, paths, root } from './lib.mjs';

const PORT = Number(process.env.WORKBENCH_PORT ?? 4525);
const PROFILE = path.join(paths.build, 'vscode');

export const workbenchUrl = `http://127.0.0.1:${PORT}`;

/** code-server is unpacked from a release tarball into build/, never installed. */
function binary() {
  const file = path.join(paths.codeServer, 'bin/code-server');
  if (existsSync(file)) return file;

  die(
    `no code-server in ${path.relative(root, paths.codeServer)}. Unpack one there:\n` +
      '  curl -fsSL -o /tmp/cs.tar.gz https://github.com/coder/code-server/releases/download/' +
      'v4.143.1/code-server-4.143.1-linux-amd64.tar.gz\n' +
      `  mkdir -p ${path.relative(root, paths.codeServer)} && tar -xzf /tmp/cs.tar.gz ` +
      `-C ${path.relative(root, paths.codeServer)} --strip-components=1`,
  );
}

function writeProfile() {
  const user = path.join(PROFILE, 'User');
  mkdirSync(user, { recursive: true });

  for (const file of ['settings.json', 'keybindings.json']) {
    cpSync(path.join(paths.profile, file), path.join(user, file), { overwrite: true });
  }

  /* The workbench remembers its own layout between runs: a split, a closed
     panel, an extra tab. A beat has to look the same every time it is filmed,
     so the remembered state goes and `settings.json` is the only input. */
  rmSync(path.join(user, 'workspaceStorage'), { recursive: true, force: true });
  rmSync(path.join(user, 'globalStorage', 'state.vscdb'), { force: true });
  rmSync(path.join(user, 'globalStorage', 'state.vscdb.backup'), { force: true });

  /* code-server writes its own config; pinning it keeps the port and the auth
     mode out of the user's ~/.config. */
  writeFileSync(
    path.join(PROFILE, 'config.yaml'),
    ['bind-addr: 127.0.0.1:' + PORT, 'auth: none', 'cert: false', ''].join('\n'),
  );
}

export async function startWorkbench({ folder } = {}) {
  binary();
  writeProfile();

  const child = spawn(
    path.join(paths.codeServer, 'bin/code-server'),
    [
      '--config',
      path.join(PROFILE, 'config.yaml'),
      '--user-data-dir',
      PROFILE,
      '--extensions-dir',
      path.join(PROFILE, 'extensions'),
      '--disable-telemetry',
      '--disable-update-check',
      '--disable-workspace-trust',
      '--disable-getting-started-override',
      ...(folder ? [folder] : []),
    ],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
      /* code-server lets $PORT override bind-addr, and this environment sets
         PORT=0: without this it listens on a random port. */
      env: { ...process.env, PORT: String(PORT) },
    },
  );

  const output = [];
  child.stdout.on('data', (chunk) => output.push(String(chunk)));
  child.stderr.on('data', (chunk) => output.push(String(chunk)));

  const deadline = Date.now() + 60_000;
  let up = false;
  while (Date.now() < deadline && !up) {
    try {
      const response = await fetch(`${workbenchUrl}/healthz`, {
        signal: AbortSignal.timeout(2_000),
      });
      up = response.ok;
    } catch {
      // not up yet
    }
    if (!up) await new Promise((resolve) => setTimeout(resolve, 250));
  }

  if (!up) {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      child.kill('SIGTERM');
    }
    die(`code-server did not answer on ${workbenchUrl}\n${output.join('')}`.trim());
  }

  log(`workbench ${workbenchUrl}`);

  return {
    url: workbenchUrl,
    async close() {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {
        child.kill('SIGTERM');
      }
    },
  };
}
