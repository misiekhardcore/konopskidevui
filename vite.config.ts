import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Rollup drops module-level directives when it rewrites a module body. Every
 * Radix-backed component in this package needs `'use client'` to survive the
 * build, otherwise a React Server Component tree cannot render it.
 */
function preserveDirectives(): Plugin {
  const clientModules = new Set<string>();

  return {
    name: 'konopskidev-preserve-directives',
    transform(code, id) {
      if (/^\s*['"]use client['"]/.test(code)) clientModules.add(id);
      return null;
    },
    renderChunk(code, chunk) {
      if (chunk.moduleIds.some((id) => clientModules.has(id))) {
        return { code: `'use client';\n${code}`, map: null };
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [react(), preserveDirectives()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    // One file per source module keeps `@konopskidev/ui/components/button`
    // imports to a single component instead of the whole library.
    rollupOptions: {
      external: (id) => id.includes('node_modules') || (!id.startsWith('.') && !id.startsWith('/')),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    sourcemap: true,
    minify: false,
    emptyOutDir: true,
  },
});
