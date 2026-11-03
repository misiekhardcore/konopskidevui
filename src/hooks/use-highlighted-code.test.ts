import { act, renderHook, waitFor } from '@testing-library/react';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { useHighlightedCode } from './use-highlighted-code';

/** The highlighted nodes as the text a reader would see. */
const text = (nodes: React.ReactNode[]) =>
  renderToStaticMarkup(React.createElement(React.Fragment, null, ...nodes));

describe('useHighlightedCode', () => {
  it('returns plain lines until the grammar loads', () => {
    const { result } = renderHook(() => useHighlightedCode('const a = 1;', 'cobol'));

    expect(result.current).toEqual(['const a = 1;']);
  });

  it('highlights the code once the language is ready', async () => {
    const { result } = renderHook(() => useHighlightedCode('const a = 1;\nconst b = 2;', 'ts'));

    // The last line is still being written, so it is returned separately.
    await waitFor(() => expect(result.current).toHaveLength(2));
    expect(JSON.stringify(result.current)).toContain('const');
  });

  it('drops the trailing newline from the rendered lines', async () => {
    const { result } = renderHook(() => useHighlightedCode('const a = 1;\n', 'ts'));

    await waitFor(() => expect(result.current).toHaveLength(1));
  });

  it('tokenizes only the new lines while the code streams', async () => {
    const { result, rerender } = renderHook(
      ({ code }: { code: string }) => useHighlightedCode(code, 'ts'),
      { initialProps: { code: 'const a = 1;\n' } },
    );

    await waitFor(() => expect(result.current).toHaveLength(1));

    rerender({ code: 'const a = 1;\nconst b = 2;\n' });
    await waitFor(() => expect(result.current).toHaveLength(2));
    expect(result.current[1]).toBeTruthy();
  });

  it('starts over when the code is replaced rather than extended', async () => {
    const { result, rerender } = renderHook(
      ({ code }: { code: string }) => useHighlightedCode(code, 'ts'),
      { initialProps: { code: 'const a = 1;\n' } },
    );

    await waitFor(() => expect(result.current).toHaveLength(1));

    rerender({ code: 'let b = 2;\n' });

    await waitFor(() => expect(text(result.current)).toContain('let'));
    expect(text(result.current)).not.toContain('const');
  });

  it('leaves the state alone when the grammar arrives after unmount', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = renderHook(() => useHighlightedCode('const a = 1;', 'ts'));

    unmount();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it('starts over when the language changes', async () => {
    const { result, rerender } = renderHook(
      ({ language }: { language: string }) =>
        useHighlightedCode('const a = 1;\nconst b = 2;', language),
      { initialProps: { language: 'ts' } },
    );

    await waitFor(() => expect(result.current).toHaveLength(2));

    rerender({ language: 'js' });
    await waitFor(() => expect(result.current).toHaveLength(2));
  });
});
