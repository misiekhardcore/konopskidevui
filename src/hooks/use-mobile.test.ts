import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile } from './use-mobile';

const originalWidth = window.innerWidth;

function setWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
}

describe('useIsMobile', () => {
  afterEach(() => setWidth(originalWidth));

  it('reports a narrow viewport as mobile', () => {
    setWidth(375);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('reports a wide viewport as desktop', () => {
    setWidth(1280);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('follows the breakpoint when the viewport changes', () => {
    setWidth(1280);

    const listeners = new Set<() => void>();
    const original = window.matchMedia;
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: window.innerWidth < 768,
          media: query,
          onchange: null,
          addEventListener: (_: string, listener: () => void) => listeners.add(listener),
          removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList,
    );

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      setWidth(320);
      listeners.forEach((listener) => listener());
    });

    expect(result.current).toBe(true);
    window.matchMedia = original;
  });
});
