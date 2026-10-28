import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// Radix primitives query these APIs; jsdom ships none of them.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!window.IntersectionObserver) {
  // embla (carousel) and cmdk observe visibility; jsdom has no implementation.
  window.IntersectionObserver = class IntersectionObserver {
    root = null;
    rootMargin = '';
    thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}

// input-otp measures the caret in a timeout; jsdom has no layout engine.
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
}

if (!window.DOMRect) {
  // recharts and the carousel measure elements with DOMRect in the browser.
  // @ts-expect-error -- minimal stand-in, only the properties Radix reads.
  window.DOMRect = class DOMRect {
    bottom = 0;
    height = 0;
    left = 0;
    right = 0;
    top = 0;
    width = 0;
    x = 0;
    y = 0;
    static fromRect() {
      return new DOMRect();
    }
    toJSON() {
      return {};
    }
  };
}
