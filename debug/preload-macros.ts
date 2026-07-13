/**
 * debug/preload-macros.ts
 *
 * Bun preload script (--preload flag) that defines the MACRO global object.
 * At build time, build.ts inlines these as string literals via esbuild `define`.
 * When running the TypeScript source directly with `bun` for debugging, esbuild
 * doesn't run, so MACRO is undefined. This preload injects the same values so
 * the code executes correctly under the debugger.
 *
 * Usage (via launch.json runtimeArgs):
 *   bun --preload ./debug/preload-macros.ts ./src/entrypoints/cli.tsx
 */

(globalThis as unknown as Record<string, unknown>).MACRO = {
  VERSION: '2.1.88-dev',
  BUILD_TIME: new Date().toISOString(),
  FEEDBACK_CHANNEL: '#claude-code-feedback',
  PACKAGE_URL: '@anthropic-ai/claude-code',
  NATIVE_PACKAGE_URL: '@anthropic-ai/claude-code',
  ISSUES_EXPLAINER: 'visit https://github.com/anthropics/claude-code/issues',
  VERSION_CHANGELOG: '',
};
