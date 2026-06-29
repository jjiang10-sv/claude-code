/**
 * Bun preload script — run this before any debug script to shim
 * build-time-only modules. Load via: bun --preload debug/preload.ts <script>
 *
 * Shims provided:
 *   - bun:bundle   → feature() always returns false (disables optional systems)
 */
import { plugin } from 'bun'
import { resolve } from 'path'

const ROOT = new URL('..', import.meta.url).pathname

plugin({
  name: 'bun:bundle shim',
  setup(build) {
    build.onResolve({ filter: /^bun:bundle$/ }, () => ({
      path: resolve(ROOT, 'stubs/bun-bundle.ts'),
    }))
  },
})
