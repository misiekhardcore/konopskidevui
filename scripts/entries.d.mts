/**
 * Types for `entries.mjs`, which both the Vite config (compiled by Vite, not
 * `tsc`) and the plain-Node build scripts import. The implementation stays `.mjs`
 * so `node scripts/…` can load it without a loader.
 */
export declare const SRC: string;
export declare const ESM_ONLY_MODULES: string[];
export declare function discoverEntries(): Record<string, string>;
export declare function discoverCjsEntries(): Record<string, string>;
