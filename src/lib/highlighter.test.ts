import { describe, expect, it } from 'vitest';

import { highlightCode, loadHighlighter } from './highlighter';

describe('highlighter', () => {
  it('returns null for a language it does not ship', async () => {
    expect(await loadHighlighter('cobol')).toBeNull();
    expect(await highlightCode('DISPLAY "hi".', 'cobol')).toBeNull();
  });

  it('tokenizes code into one entry per line', async () => {
    const lines = await highlightCode('const answer = 42;\nconsole.log(answer);', 'ts');

    expect(lines).not.toBeNull();
    expect(lines).toHaveLength(2);
    expect(JSON.stringify(lines)).toContain('answer');
  });

  it('accepts the plain language name as well as its alias', async () => {
    const viaAlias = await highlightCode('print("hi")', 'py');
    const viaName = await highlightCode('print("hi")', 'python');

    expect(viaAlias).not.toBeNull();
    expect(viaName).not.toBeNull();
  });

  it('continues from a grammar state for streamed code', async () => {
    const highlighter = await loadHighlighter('ts');
    if (!highlighter) throw new Error('typescript should be available');

    const head = highlighter.highlight('const first = 1;');
    const tail = highlighter.highlight('const second = 2;', head.state);

    expect(head.lines).toHaveLength(1);
    expect(tail.lines).toHaveLength(1);
    expect(tail.state).toBeTruthy();
  });

  it('tokenizes ansi line by line', async () => {
    const lines = await highlightCode('one\ntwo', 'ansi');

    expect(lines).not.toBeNull();
    expect(lines?.length).toBeGreaterThanOrEqual(2);
  });
});
