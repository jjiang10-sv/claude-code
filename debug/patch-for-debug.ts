/**
 * Patches source files that import `bun:bundle` so they can be run directly
 * with `bun run`. Only modifies files under src/ — does NOT touch .git or node_modules.
 *
 * Usage:
 *   bun debug/patch-for-debug.ts          # apply patches
 *   bun debug/patch-for-debug.ts --restore # restore originals
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const ROOT = new URL('..', import.meta.url).pathname
const SRC = join(ROOT, 'src')
const BACKUP_SUFFIX = '.bak'
const RESTORE = process.argv.includes('--restore')

// Find all files that import from bun:bundle
const files = execSync(`grep -rl "from 'bun:bundle'" "${SRC}"`, { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)

if (RESTORE) {
  let restored = 0
  for (const file of files) {
    const bak = file + BACKUP_SUFFIX
    if (existsSync(bak)) {
      writeFileSync(file, readFileSync(bak, 'utf8'))
      writeFileSync(bak, '') // clear backup
      console.log(`  restored: ${file.replace(ROOT, '')}`)
      restored++
    }
  }
  console.log(`\nRestored ${restored} files.`)
} else {
  // Compute relative path from src/ to stubs/
  let patched = 0
  for (const file of files) {
    const original = readFileSync(file, 'utf8')
    // Skip if already patched
    if (original.includes('stubs/bun-bundle')) continue
    // Write backup
    writeFileSync(file + BACKUP_SUFFIX, original)
    // Replace the import — compute relative depth
    const depth = file.replace(SRC + '/', '').split('/').length - 1
    const relToStubs = '../'.repeat(depth + 1) + 'stubs/bun-bundle.js'
    const patched_content = original.replace(
      /from 'bun:bundle'/g,
      `from '${relToStubs}'`
    )
    writeFileSync(file, patched_content)
    console.log(`  patched: ${file.replace(ROOT, '')}`)
    patched++
  }
  console.log(`\nPatched ${patched} files. Run "bun debug/patch-for-debug.ts --restore" to undo.`)
}
