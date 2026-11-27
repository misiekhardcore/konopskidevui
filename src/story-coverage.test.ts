import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/**
 * The story and test suite only covers what somebody remembered to write. These
 * assertions make the gaps noisy: a component module needs a stories file, that
 * file needs enough stories to show the component's shapes, and every part that
 * takes a prop of its own needs a story that renders it — because `subcomponents`
 * in a meta is documentation only, and its parts never get controls.
 *
 * Both component families are scanned, `components/ui` and the AI family in
 * `components/ai`, so a module in either one that ships without a story is a red
 * build rather than a note in review (ADR 0001).
 */

/** Stories per file, counting the parts that document themselves separately. */
const MIN_STORIES = 3;

/** Props every wrapper forwards without adding anything of its own. */
const PASS_THROUGH_PROPS = new Set(['className', 'children', 'style', 'asChild']);

/** The source families, each with its own Storybook kind. */
const FAMILIES = ['ai', 'ui'] as const;

const families = FAMILIES.map((family) => ({
  family,
  dir: path.join(import.meta.dirname, 'components', family),
}));

function componentFilesIn(dir: string) {
  return fs
    .readdirSync(dir)
    .filter(
      (file) =>
        file.endsWith('.tsx') && !file.endsWith('.stories.tsx') && !file.endsWith('.test.tsx'),
    );
}

const componentFiles = families.flatMap(({ family, dir }) =>
  componentFilesIn(dir).map((file) => ({ family, dir, file })),
);

function parse(filePath: string) {
  return ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}

function print(node: ts.Node) {
  return node.getText();
}

/** Removes `React.ComponentProps<…>` and friends, which are the forward-only part. */
function withoutForwardedProps(typeText: string) {
  let remaining = typeText;

  for (let index = remaining.indexOf('ComponentProps<'); index !== -1;) {
    let depth = 0;
    let end = index + 'ComponentProps'.length;

    for (; end < remaining.length; end += 1) {
      if (remaining[end] === '<') depth += 1;
      if (remaining[end] === '>') {
        depth -= 1;
        if (depth === 0) break;
      }
    }

    remaining = remaining.slice(0, index) + remaining.slice(end + 1);
    index = remaining.indexOf('ComponentProps<');
  }

  return remaining;
}

/**
 * The optional members left over after the strip above: only those can become a
 * control, because a required prop is part of the composition, not a choice.
 */
function ownPropNames(typeText: string) {
  const names = new Set<string>();

  if (typeText.includes('VariantProps<')) names.add('variant');

  for (const member of withoutForwardedProps(typeText).matchAll(/([A-Za-z_$][\w$]*)\?\s*:/g)) {
    if (!PASS_THROUGH_PROPS.has(member[1])) names.add(member[1]);
  }

  return names;
}

/** Exported function components, with the props that are not just forwarded. */
function partsOf(sourceFile: ts.SourceFile) {
  const parts = new Map<string, Set<string>>();
  const exported = new Set<string>();

  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      const propsParam = statement.parameters[0];
      const propsType = propsParam?.type ? print(propsParam.type) : '';

      parts.set(statement.name.text, propsType ? ownPropNames(propsType) : new Set());
    }

    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause) &&
      !statement.moduleSpecifier
    ) {
      for (const element of statement.exportClause.elements) exported.add(element.name.text);
    }

    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      statement.modifiers?.some(({ kind }) => kind === ts.SyntaxKind.ExportKeyword)
    ) {
      exported.add(statement.name.text);
    }
  }

  return [...parts].filter(([name]) => exported.has(name));
}

function storyExports(sourceFile: ts.SourceFile) {
  return sourceFile.statements
    .filter(ts.isVariableStatement)
    .filter((statement) =>
      statement.modifiers?.some(({ kind }) => kind === ts.SyntaxKind.ExportKeyword),
    )
    .flatMap((statement) =>
      statement.declarationList.declarations.map((declaration) => declaration.name.getText()),
    );
}

describe('story coverage', () => {
  it.each(componentFiles)('$file has a stories file', ({ dir, file }) => {
    const stories = file.replace(/\.tsx$/, '.stories.tsx');

    expect(fs.readdirSync(dir), `${stories} is missing`).toContain(stories);
  });

  const storyFiles = componentFiles.map(({ family, dir, file }) => ({
    family,
    dir,
    file: file.replace(/\.tsx$/, '.stories.tsx'),
  }));

  describe('stories', () => {
    it.each(storyFiles)('$file', ({ dir, file }) => {
      const stories = storyExports(parse(path.join(dir, file)));

      expect(stories.length, `${file} exports ${stories.join(', ')}`).toBeGreaterThanOrEqual(
        MIN_STORIES,
      );
    });

    it.each(storyFiles)('$file is snapshotted by Chromatic', ({ dir, file }) => {
      const stories = fs.readFileSync(path.join(dir, file), 'utf8');

      // Snapshots are off project-wide; a component opts back in on exactly one
      // story, so a rename cannot quietly drop it out of the visual suite.
      expect(
        stories.includes('disableSnapshot: false'),
        `${file} has no story with chromatic.disableSnapshot: false`,
      ).toBe(true);
    });
  });

  describe('part stories', () => {
    const parts = componentFiles.flatMap(({ dir, file }) =>
      partsOf(parse(path.join(dir, file)))
        .filter(([, ownProps]) => ownProps.size > 0)
        .map(([name, ownProps]) => ({
          name,
          ownProps: [...ownProps].sort().join(', '),
          storiesPath: path.join(dir, file.replace(/\.tsx$/, '.stories.tsx')),
        })),
    );

    it.each(parts.map(({ name }) => name))('%s has a story of its own', (name) => {
      const part = parts.find((candidate) => candidate.name === name);
      const stories = fs.readFileSync(part?.storiesPath ?? '', 'utf8');

      expect(
        stories.includes(`component: ${name}`),
        `${path.basename(part?.storiesPath ?? '')} has no story rendering ${name} (own props: ${part?.ownProps})`,
      ).toBe(true);
    });
  });
});
