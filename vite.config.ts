import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

import { discoverCjsEntries, discoverEntries } from './scripts/entries.mjs';

/**
 * Rollup drops module-level directives when it rewrites a module body, and in a
 * bundled output it must: a directive from one input would otherwise mark the
 * whole chunk. Every Radix-backed component in this package needs `'use client'`
 * to survive the build, so the directive is reapplied per emitted module.
 *
 * Rollup keeps the directive on its own when a module is emitted in place, which
 * is the usual case here. The injection is therefore conditional: without that
 * check every client module came out marked twice.
 */
function preserveDirectives(): Plugin {
  const clientModules = new Set<string>();

  return {
    name: 'konopskidev-preserve-directives',
    transform(code, id) {
      if (/^\s*(['"])use client\1/.test(code)) clientModules.add(id);
      return null;
    },
    renderChunk(code, chunk) {
      if (!chunk.moduleIds.some((id) => clientModules.has(id))) return null;
      if (/^\s*(['"])use client\1/.test(code)) return null;

      return { code: `'use client';\n${code}`, map: null };
    },
  };
}

/**
 * `pnpm build` runs this config twice, once per mode: `es` writes `dist/**\/*.js`
 * and clears the directory, `cjs` adds `dist/**\/*.cjs` next to it. Two passes
 * rather than two outputs because the CommonJS one ships a smaller entry set.
 */
export default defineConfig(({ mode }) => {
  const format = mode === 'cjs' ? 'cjs' : 'es';
  const extension = format === 'es' ? '.js' : '.cjs';

  return {
    plugins: [react(), preserveDirectives()],
    build: {
      lib: {
        entry: format === 'es' ? discoverEntries() : discoverCjsEntries(),
        // One file per source module, so `@konopskidev/ui/components/button`
        // resolves to a single component instead of the whole library.
        formats: [format],
      },
      outDir: 'dist',
      // The second pass adds to the first pass's output instead of removing it.
      emptyOutDir: format === 'es',
      rollupOptions: {
        external: (id) =>
          id.includes('node_modules') || (!id.startsWith('.') && !id.startsWith('/')),
        output: {
          entryFileNames: `[name]${extension}`,
          chunkFileNames: `chunks/[name]-[hash]${extension}`,
        },
      },
      sourcemap: true,
      minify: false,
    },
  };
});
