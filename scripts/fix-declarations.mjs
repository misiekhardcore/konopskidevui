/**
 * `tsc` copies relative specifiers verbatim, but the JavaScript emitted by
 * rollup uses explicit `.js` extensions. Node's ESM resolver (and `attw`'s
 * node16 check) needs the declarations to spell the same targets, so every
 * relative import in `dist/**\/*.d.ts` gets the `.js` extension the runtime
 * file already carries.
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function resolveExtension(fromFile, specifier) {
  if (!specifier.startsWith('.')) return specifier;
  if (/\.[cm]?jsx?$|\.json$|\.css$/.test(specifier)) return specifier;

  const target = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [`${target}.d.ts`, path.join(target, 'index.d.ts')];

  return candidates.some((candidate) => fs.existsSync(candidate)) ? `${specifier}.js` : specifier;
}

let rewritten = 0;

for (const file of walk(dist).filter((file) => file.endsWith('.d.ts'))) {
  const source = fs.readFileSync(file, 'utf8');
  const fixed = source.replace(
    /(from\s+|import\s*\(\s*)(['"])(\.{1,2}\/[^'"]*)\2/g,
    (match, prefix, quote, specifier) =>
      `${prefix}${quote}${resolveExtension(file, specifier)}${quote}`,
  );

  if (fixed === source) continue;
  fs.writeFileSync(file, fixed);
  rewritten += 1;
}

console.log(`fix-declarations: rewrote ${rewritten} declaration files`);
