/**
 * Creates empty stub .ts files for all source files that are missing from
 * the leaked Claude Code sourcemap. Run with: bun scripts/create-stubs.ts
 */
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { execSync } from 'child_process'

const ROOT = resolve(import.meta.dir, '..')
const SRC = join(ROOT, 'src')

// Run tsc to get errors and parse missing modules
const tscOutput = execSync('bun run typecheck 2>&1 || true', {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024,
})

const missingModules = new Map<string, string>() // absolutePath -> importedBy

const errorRegex = /^(src\/[^(]+)\(\d+,\d+\): error TS2307: Cannot find module '(\.[^']+)'/gm
let match: RegExpExecArray | null

while ((match = errorRegex.exec(tscOutput)) !== null) {
  const importingFile = join(ROOT, match[1])
  const moduleSpec = match[2]

  // Resolve the module path relative to the importing file
  let modulePath = resolve(dirname(importingFile), moduleSpec)
  // Strip .js extension and try .ts
  modulePath = modulePath.replace(/\.js$/, '.ts')

  if (!existsSync(modulePath) && !missingModules.has(modulePath)) {
    missingModules.set(modulePath, match[1])
  }
}

console.log(`Creating ${missingModules.size} stub files...\n`)

for (const [absPath, importedBy] of missingModules) {
  // Skip if already exists
  if (existsSync(absPath)) continue

  const dir = dirname(absPath)
  mkdirSync(dir, { recursive: true })

  const relPath = absPath.replace(ROOT + '/', '')
  const content = `// Stub: this file was not captured in the sourcemap leak.\n// Referenced from: ${importedBy}\nexport {}\n`
  writeFileSync(absPath, content, 'utf8')
  console.log(`  created: ${relPath}`)
}

console.log('\nDone.')
