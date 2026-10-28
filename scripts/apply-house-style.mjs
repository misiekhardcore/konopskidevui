#!/usr/bin/env node
/**
 * Applies the konopskidev style contract to the fetched shadcn components.
 *
 * The registry ships its own visual language (rounded-xl surfaces, ring borders,
 * ring focus states, drop shadows). konopskidev's language is different and is
 * documented in `docs/style-contract.md`. This script performs the mechanical,
 * unambiguous half of the translation; anything that needs judgement (surface
 * composition, control heights, the konopskidev-only props) is hand-written.
 *
 * It is idempotent: running it twice changes nothing. Run it after every
 * `shadcn add`, then run `pnpm format`.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const UI_DIR = new URL('../src/components/ui/', import.meta.url).pathname;

/** Ordered: directional radii first, so `rounded-t-xl` is not caught by `rounded-xl`. */
const RULES = [
  // 1. Imports: the package ships relative specifiers so declarations and the
  //    built ESM resolve without a bundler alias.
  { find: /from "@\/components\/ui\/([a-z0-9-]+)"/g, replace: 'from "./$1"' },
  { find: /from "@\/hooks\/([a-z0-9-]+)"/g, replace: 'from "../../hooks/$1"' },
  { find: /from "@\/lib\/([a-z0-9-]+)"/g, replace: 'from "../../lib/$1"' },

  // 2. Radius: one step, everywhere. konopskidev has exactly one corner radius.
  { find: /rounded-(t|b|l|r|tl|tr|bl|br)-(xl|lg|md)/g, replace: 'rounded-$1-sm' },
  { find: /rounded-\[min\(var\(--radius-(?:md|lg|xl)\),[0-9]+px\)\]/g, replace: 'rounded-sm' },
  // The registry hard-codes small control radii; the house scale only has tokens.
  { find: /rounded-\[(?:2|4|6)px\]/g, replace: 'rounded-sm' },
  { find: /rounded-(xl|lg|md)/g, replace: 'rounded-sm' },

  // 3. Focus: an outline via the `focus-ring` utility, never a ring.
  {
    find: /focus-visible:border-ring focus-visible:ring-\d+ focus-visible:ring-ring\/\d+/g,
    replace: 'focus-ring',
  },
  {
    find: /focus-visible:ring-\d+ focus-visible:ring-ring\/\d+/g,
    replace: 'focus-ring',
  },
  { find: /focus-visible:ring-\d+ focus-visible:ring-ring/g, replace: 'focus-ring' },
  { find: /focus-visible:ring-destructive\/\d+/g, replace: 'focus-visible:outline-destructive' },
  { find: /focus-visible:ring-(?:ring\/\d+|\d+)/g, replace: '' },
  { find: /focus-visible:border-ring/g, replace: '' },

  // 4. Depth: borders instead of shadows, one shadow for floating surfaces.
  { find: /\bshadow-(?:xs|sm|md)\b/g, replace: '' },
  { find: /\bshadow-xl\b/g, replace: 'shadow-lg' },

  // 5. Ring borders on surfaces become real borders.
  { find: /ring-1 ring-foreground\/\d+/g, replace: 'border border-border' },
  { find: /ring-1 ring-ring\/\d+/g, replace: 'border border-border' },

  // 6. Controls are 16px, not responsive 16→14px.
  { find: /\btext-base md:text-sm\b/g, replace: 'text-sm' },

  // 7. House rule: buttons are clickable, disabled controls are not.
  {
    find: /disabled:pointer-events-none disabled:opacity-50/g,
    replace: 'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  },
];

const files = readdirSync(UI_DIR).filter((file) => file.endsWith('.tsx'));
let changed = 0;

for (const file of files) {
  const path = join(UI_DIR, file);
  const before = readFileSync(path, 'utf8');
  let after = before;

  for (const rule of RULES) {
    after = after.replace(rule.find, rule.replace);
  }

  // Collapse the whitespace the removals leave behind, but only inside
  // single-line string literals — indentation must survive untouched.
  after = after.replace(/"([^"\n]*)"/g, (_match, inner) => {
    const tidy = inner.replace(/[ \t]{2,}/g, ' ').trim();
    return `"${tidy}"`;
  });

  if (after !== before) {
    writeFileSync(path, after);
    changed += 1;
  }
}

console.log(`Applied the konopskidev style contract to ${changed}/${files.length} components.`);
