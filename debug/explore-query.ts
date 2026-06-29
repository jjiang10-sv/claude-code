/**
 * Debug: QueryEngine — how a user prompt becomes an LLM call
 *
 * The flow is:
 *   User input
 *     → processUserInput()       src/utils/processUserInput/processUserInput.ts
 *         → detects slash command vs plain prompt
 *     → QueryEngine.ask()        src/QueryEngine.ts:1186
 *         → query()              src/query.ts:219
 *             → queryLoop()      src/query.ts:241  ← the main agentic loop
 *                 → claude API call (src/services/api/claude.ts)
 *                 → tool execution (src/services/tools/toolExecution.ts)
 *                 → loops until model stops calling tools
 *
 * Good breakpoints:
 *   src/query.ts:241          queryLoop() — the agentic loop itself
 *   src/services/api/claude.ts  — the raw API call to Anthropic
 *   src/services/tools/toolExecution.ts — when a tool is executed
 *   src/QueryEngine.ts:1186   ask() — high-level entry point
 *
 * This script imports the key modules so VS Code resolves them.
 * Set ANTHROPIC_API_KEY before running to make real API calls.
 */

// Core query modules — set breakpoints inside these files
import { query } from '../src/query.js'
import { ask } from '../src/QueryEngine.js'

// User input processing — how raw text is classified
import { processUserInput } from '../src/utils/processUserInput/processUserInput.js'

// The API layer — the actual HTTP call to Anthropic
import { queryWithModel as claudeAPICall } from '../src/services/api/claude.js'

// Tool execution — how the model's tool_use blocks get run
import { runToolUse as executeToolCall } from '../src/services/tools/toolExecution.js'

console.log('=== QueryEngine Debug ===')
console.log()
console.log('Key functions loaded. Set breakpoints in:')
console.log('  src/query.ts           → queryLoop() — the main agentic loop')
console.log('  src/services/api/claude.ts → claudeAPICall() — raw API call')
console.log('  src/services/tools/toolExecution.ts → executeToolCall()')
console.log()
console.log('Exports available for inspection:')
console.log('  query:', typeof query)
console.log('  ask:', typeof ask)
console.log('  processUserInput:', typeof processUserInput)
console.log('  claudeAPICall:', typeof claudeAPICall)
console.log('  executeToolCall:', typeof executeToolCall)
