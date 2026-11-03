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
 */

/** Stories per file, counting the parts that document themselves separately. */
const MIN_STORIES = 3;

/** Props every wrapper forwards without adding anything of its own. */
const PASS_THROUGH_PROPS = new Set(['className', 'children', 'style', 'asChild']);

const uiDir = path.join(import.meta.dirname, 'components', 'ui');
const files = fs.readdirSync(uiDir);
const componentFiles = files.filter(
  (file) => file.endsWith('.tsx') && !file.endsWith('.stories.tsx') && !file.endsWith('.test.tsx'),
);

function parse(file: string) {
  const filePath = path.join(uiDir, file);

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
  it.each(componentFiles)('%s has a stories file', (file) => {
    const stories = file.replace(/\.tsx$/, '.stories.tsx');

    expect(files, `${stories} is missing`).toContain(stories);
  });

  const storyFiles = componentFiles.map((file) => file.replace(/\.tsx$/, '.stories.tsx'));

  describe('stories', () => {
    it.each(storyFiles)('%s', (storyFile) => {
      const sourceFile = parse(storyFile);
      const stories = storyExports(sourceFile);

      expect(stories.length, `${storyFile} exports ${stories.join(', ')}`).toBeGreaterThanOrEqual(
        MIN_STORIES,
      );
    });

    it.each(storyFiles)('%s is snapshotted by Chromatic', (storyFile) => {
      const stories = fs.readFileSync(path.join(uiDir, storyFile), 'utf8');

      // Snapshots are off project-wide; a component opts back in on exactly one
      // story, so a rename cannot quietly drop it out of the visual suite.
      expect(
        stories.includes('disableSnapshot: false'),
        `${storyFile} has no story with chromatic.disableSnapshot: false`,
      ).toBe(true);
    });
  });

  describe('part stories', () => {
    const parts = componentFiles.flatMap((file) =>
      partsOf(parse(file))
        .filter(([, ownProps]) => ownProps.size > 0)
        .map(([name, ownProps]) => ({
          name,
          ownProps: [...ownProps].sort().join(', '),
          storiesFile: file.replace(/\.tsx$/, '.stories.tsx'),
        })),
    );

    it.each(parts.map(({ name }) => name))('%s has a story of its own', (name) => {
      const part = parts.find((candidate) => candidate.name === name);
      const stories = fs.readFileSync(path.join(uiDir, part?.storiesFile ?? ''), 'utf8');

      expect(
        stories.includes(`component: ${name}`),
        `${part?.storiesFile} has no story rendering ${name} (own props: ${part?.ownProps})`,
      ).toBe(true);
    });
  });
});
