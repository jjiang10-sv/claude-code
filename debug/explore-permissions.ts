/**
 * Debug: Permissions system — how Claude asks before running tools
 *
 * Every tool call goes through a permission check:
 *   executeToolCall()
 *     → canUseTool()              src/hooks/useCanUseTool.tsx
 *         → getPermissionMode()   src/utils/permissions/PermissionMode.ts
 *         → checkToolPermission() src/utils/permissions/permissions.ts
 *             → checks allow/deny rules from config
 *             → may prompt user interactively
 *
 * Permission modes:
 *   "default"           → ask for dangerous tools (bash, file writes)
 *   "acceptEdits"       → auto-approve file edits, ask for bash
 *   "bypassPermissions" → skip all prompts (--dangerously-skip-permissions)
 *   "plan"              → never execute, only plan
 *
 * Good breakpoints:
 *   src/utils/permissions/permissions.ts      → checkToolPermission()
 *   src/utils/permissions/permissionRuleParser.ts → rule matching logic
 *   src/utils/permissions/PermissionMode.ts   → mode transitions
 *   src/hooks/useCanUseTool.tsx               → React hook for UI
 */

import { PermissionMode } from '../src/utils/permissions/PermissionMode.js'
import {
  parsePermissionRule,
  matchesPermissionRule,
} from '../src/utils/permissions/permissionRuleParser.js'
import { getDefaultPermissions } from '../src/utils/permissions/permissions.js'

console.log('=== Permissions Debug ===')
console.log()

// Show permission modes
console.log('Permission modes:', Object.values(PermissionMode))

// Default permissions config
const defaults = getDefaultPermissions()
console.log('\nDefault permission rules:', JSON.stringify(defaults, null, 2))

// Example: parse a permission rule
const rule = parsePermissionRule('Bash(git *)')
console.log('\nParsed rule "Bash(git *)":', JSON.stringify(rule, null, 2))

// Example: test if a command matches
const matches = matchesPermissionRule(rule, 'Bash', 'git status')
console.log('Does "git status" match?', matches)
