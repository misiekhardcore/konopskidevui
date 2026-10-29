/**
 * Publishes `src/styles` as `dist/styles`.
 *
 * The stylesheet used to be the one entry point that resolved into `src`, so a
 * packaging change could break it without breaking a component import. It now
 * ships from `dist` with the rest of the build.
 *
 * The whole directory is copied, not just `globals.css`: that file imports its
 * siblings by relative path (`./tokens.css`, `./prose.css`, …), so a lone copy
 * would resolve to nothing.
 *
 * The `@source` block is appended to the **copy** only. Tailwind resolves
 * `@source` against the file that declares it, so inside `dist/styles` these
 * paths point at the package's own `dist` — a consumer no longer has to know
 * where the package lives in `node_modules`, and the registration cannot drift
 * from the build. Keeping it out of `src/styles` matters because Storybook
 * compiles that file directly, from a checkout where `dist` may not exist.
 */
import fs from 'node:fs';
import path from 'node:path';

const source = path.join(process.cwd(), 'src', 'styles');
const target = path.join(process.cwd(), 'dist', 'styles');

const SOURCE_REGISTRATION = `
/*
 * Register this package's own modules as Tailwind sources.
 *
 * Tailwind does not scan \`node_modules\`, so without these lines every component
 * renders unstyled with no error anywhere. The paths are relative to this file,
 * which is why they work from a consumer's install without configuration.
 */
@source '../components';
@source '../lib';
@source '../hooks';
`;

export function copyStyles() {
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });

  const files = fs.readdirSync(source).filter((file) => file.endsWith('.css'));

  for (const file of files) {
    const contents = fs.readFileSync(path.join(source, file), 'utf8');
    const output = file === 'globals.css' ? contents + SOURCE_REGISTRATION : contents;

    fs.writeFileSync(path.join(target, file), output);
  }

  console.log(`copy-styles: ${files.length} stylesheets → dist/styles`);
}

if (import.meta.url === `file://${process.argv[1]}`) copyStyles();
