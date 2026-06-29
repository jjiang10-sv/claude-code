/**
 * Debug: Skills system
 *
 * A "skill" is a slash command (/simplify, /review, /update-config, etc.)
 * that Claude Code ships built-in or loads from ~/.claude/skills/.
 *
 * Key files to explore:
 *   src/skills/bundled/index.ts     → registers all built-in skills at startup
 *   src/skills/bundled/simplify.ts  → example: the /simplify skill
 *   src/services/skillSearch/       → how skills are searched and matched
 *   src/utils/processUserInput/processSlashCommand.tsx → dispatches /commands
 *   src/tools/SkillTool/SkillTool.ts → the Tool that executes a skill
 *
 * Breakpoint suggestions:
 *   - initBundledSkills()         → see what runs at startup
 *   - registerBundledSkill()      → how each skill is registered
 *   - processSlashCommand()       → trace what happens when user types /foo
 */

import { initBundledSkills } from '../src/skills/bundled/index.js'
import { getBundledSkills } from '../src/skills/bundledSkills.js'

console.log('=== Skills Debug ===\n')

// Register all built-in skills (same as startup)
// Breakpoint here → step into to see each skill being registered
initBundledSkills()

// List all registered skills
const skills = getBundledSkills()
console.log(`Registered ${skills.length} skills:\n`)
for (const skill of skills) {
  console.log(`  /${skill.name}  —  ${skill.description ?? '(no description)'}`)
}
