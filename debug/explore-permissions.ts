/**
 * Debug: Permissions system — how Claude decides before running tools
 *
 * Every tool call flows through:
 *   hasPermissionsToUseTool()      src/utils/permissions/permissions.ts
 *     → getAllowRules(context)     → checks alwaysAllowRules
 *     → getDenyRules(context)      → checks alwaysDenyRules
 *     → getAskRules(context)       → checks alwaysAskRules
 *     → tool.checkPermissions()    → per-tool logic (BashTool, etc.)
 *
 * Permission modes (PermissionMode type, not a runtime enum):
 *   "default"           → ask for dangerous tools (bash, file writes)
 *   "acceptEdits"       → auto-approve file edits, still ask for bash
 *   "bypassPermissions" → skip all prompts (--dangerously-skip-permissions)
 *   "plan"              → never execute, only plan
 *   "dontAsk"           → auto-deny anything requiring a prompt
 *   "auto"              → ant-only; AI classifier decides (TRANSCRIPT_CLASSIFIER flag)
 *
 * Good breakpoints:
 *   src/utils/permissions/permissions.ts          → hasPermissionsToUseTool()
 *   src/utils/permissions/permissionRuleParser.ts → permissionRuleValueFromString()
 *   src/utils/permissions/permissionSetup.ts      → initializeToolPermissionContext()
 *   src/hooks/useCanUseTool.tsx                   → React hook wiring the above into UI
 */

import {
  PERMISSION_MODES,
  permissionModeTitle,
  permissionModeShortTitle,
  permissionModeSymbol,
  permissionModeFromString,
} from '../src/utils/permissions/PermissionMode.js'

import {
  permissionRuleValueFromString,
  permissionRuleValueToString,
  escapeRuleContent,
  normalizeLegacyToolName,
  getLegacyToolNames,
} from '../src/utils/permissions/permissionRuleParser.js'

import {
  getAllowRules,
  getDenyRules,
  getAskRules,
  toolAlwaysAllowedRule,
  getDenyRuleForTool,
} from '../src/utils/permissions/permissions.js'

import type { PermissionMode } from '../src/utils/permissions/PermissionMode.js'
import type { ToolPermissionContext } from '../src/Tool.js'

console.log('=== Permissions Debug ===\n')

// ─── 1. Permission modes ───────────────────────────────────────────────────
console.log('All permission modes:')
for (const mode of PERMISSION_MODES) {
  const title  = permissionModeTitle(mode as PermissionMode)
  const short  = permissionModeShortTitle(mode as PermissionMode)
  const symbol = permissionModeSymbol(mode as PermissionMode) || '(none)'
  console.log(`  ${mode.padEnd(20)} title="${title}"  short="${short}"  symbol=${symbol}`)
}

// ─── 2. permissionModeFromString ───────────────────────────────────────────
console.log('\npermissionModeFromString examples:')
for (const s of ['default', 'bypassPermissions', 'plan', 'unknown-garbage']) {
  console.log(`  "${s}" → "${permissionModeFromString(s)}"`)
}

// ─── 3. Rule parsing ────────────────────────────────────────────────────────
console.log('\nRule parsing (permissionRuleValueFromString):')
const examples = [
  'Bash',
  'Bash(git *)',
  'Bash(npm install)',
  'Bash(python -c "print\\(1\\)")',  // escaped parens in content
  'Write',
  'mcp__filesystem',
  'mcp__filesystem__read_file',
]
for (const raw of examples) {
  const parsed = permissionRuleValueFromString(raw)
  const roundtrip = permissionRuleValueToString(parsed)
  console.log(`  parse("${raw}")`)
  console.log(`    → toolName: "${parsed.toolName}"  ruleContent: ${JSON.stringify(parsed.ruleContent ?? null)}`)
  console.log(`    → roundtrip: "${roundtrip}"`)
}

// ─── 4. escapeRuleContent ───────────────────────────────────────────────────
console.log('\nescapeRuleContent:')
const toEscape = ['simple', 'psycopg2.connect()', 'echo "test\\nvalue"']
for (const s of toEscape) {
  console.log(`  "${s}" → "${escapeRuleContent(s)}"`)
}

// ─── 5. Legacy tool name aliases ────────────────────────────────────────────
console.log('\nLegacy tool name normalization:')
const legacyNames = ['Task', 'KillShell', 'AgentOutputTool', 'BashOutputTool', 'Bash', 'Write']
for (const name of legacyNames) {
  const canonical = normalizeLegacyToolName(name)
  const reverse   = getLegacyToolNames(canonical)
  console.log(`  "${name}" → canonical: "${canonical}"  (legacy aliases: ${JSON.stringify(reverse)})`)
}

// ─── 6. Rule evaluation against a mock context ─────────────────────────────
console.log('\nRule evaluation with a mock ToolPermissionContext:')

const mockContext: ToolPermissionContext = {
  mode: 'default',
  shouldAvoidPermissionPrompts: false,
  alwaysAllowRules: {
    // These are the string rule formats stored in ~/.claude/settings.json
    localSettings:  ['Bash(git *)', 'Bash(npm test)', 'Read'],
    globalSettings: ['Write'],
    projectSettings: [],
    localProjectSettings: [],
    enterpriseSettings: [],
    cliArg: [],
    command: [],
    session: [],
  },
  alwaysDenyRules: {
    localSettings:  ['Bash(rm -rf *)'],
    globalSettings: [],
    projectSettings: [],
    localProjectSettings: [],
    enterpriseSettings: [],
    cliArg: [],
    command: [],
    session: [],
  },
  alwaysAskRules: {
    localSettings:  [],
    globalSettings: [],
    projectSettings: [],
    localProjectSettings: [],
    enterpriseSettings: [],
    cliArg: [],
    command: [],
    session: [],
  },
}

const allowRules = getAllowRules(mockContext)
const denyRules  = getDenyRules(mockContext)
const askRules   = getAskRules(mockContext)

console.log(`\n  Allow rules (${allowRules.length}):`)
for (const r of allowRules) {
  console.log(`    [${r.source}] ${permissionRuleValueToString(r.ruleValue)}`)
}

console.log(`\n  Deny rules (${denyRules.length}):`)
for (const r of denyRules) {
  console.log(`    [${r.source}] ${permissionRuleValueToString(r.ruleValue)}`)
}

console.log(`\n  Ask rules (${askRules.length}):`)
for (const r of askRules) {
  console.log(`    [${r.source}] ${permissionRuleValueToString(r.ruleValue)}`)
}

// ─── 7. toolAlwaysAllowedRule / getDenyRuleForTool ──────────────────────────
console.log('\nWhole-tool rule lookup:')

const mockReadTool = { name: 'Read', mcpInfo: undefined }
const mockBashTool = { name: 'Bash', mcpInfo: undefined }
const mockRmTool   = { name: 'Bash', mcpInfo: undefined }

const readAllow = toolAlwaysAllowedRule(mockContext, mockReadTool)
const bashAllow = toolAlwaysAllowedRule(mockContext, mockBashTool)
const bashDeny  = getDenyRuleForTool(mockContext, mockRmTool)

console.log(`  toolAlwaysAllowedRule for "Read": ${readAllow ? `[${readAllow.source}] ${permissionRuleValueToString(readAllow.ruleValue)}` : 'null — no whole-tool rule found (only prefix rules exist)'}`)
console.log(`  toolAlwaysAllowedRule for "Bash": ${bashAllow ? `[${bashAllow.source}] ${permissionRuleValueToString(bashAllow.ruleValue)}` : 'null — only Bash(git *) prefix rules, not a whole-tool allow'}`)
console.log(`  getDenyRuleForTool for "Bash":    ${bashDeny  ? `[${bashDeny.source}]  ${permissionRuleValueToString(bashDeny.ruleValue)}`  : 'null — rm -rf is a prefix deny, not a whole-tool deny'}`)

console.log('\n=== Done ===')
