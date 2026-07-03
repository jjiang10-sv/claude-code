/**
 * Debug: QueryEngine — how a user prompt becomes an LLM call and a tool loop
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  User input (string)                                    │
 * │    ↓                                                    │
 * │  processUserInput()     classify: slash cmd vs prompt   │
 * │    ↓                                                    │
 * │  QueryEngine.ask() / query()   build QueryParams        │
 * │    ↓                                                    │
 * │  query()   AsyncGenerator — yields Message stream       │
 * │    ↓                                                    │
 * │  queryLoop()  ← MAIN AGENTIC LOOP  (query.ts:241)       │
 * │    ├── deps.callModel()  → Anthropic streaming API      │
 * │    ├── for each tool_use block in response:             │
 * │    │     runToolUse() → execute the tool                │
 * │    └── loop until stop_reason != tool_use               │
 * └─────────────────────────────────────────────────────────┘
 *
 * Key breakpoint targets:
 *   src/query.ts:241               queryLoop()       — the agentic loop itself
 *   src/query.ts:659               deps.callModel()  — API call starts here
 *   src/services/api/claude.ts:752 queryModelWithStreaming() — raw HTTP stream
 *   src/services/tools/toolExecution.ts:337 runToolUse() — tool dispatch
 *   src/QueryEngine.ts:1186        ask()  — high-level REPL entry point
 *
 * Run:   bun debug/explore-query.ts
 * Set ANTHROPIC_API_KEY to make a real API call at the bottom of this script.
 */

// ─── Core query pipeline ────────────────────────────────────────────────────
import { query } from '../src/query.js'
import type { QueryParams } from '../src/query.js'
import { QueryEngine } from '../src/QueryEngine.js'
import { ask } from '../src/QueryEngine.js'

// ─── API layer ───────────────────────────────────────────────────────────────
import {
  getAPIMetadata,
  getPromptCachingEnabled,
  getMaxOutputTokensForModel,
  buildSystemPromptBlocks,
  userMessageToMessageParam,
  assistantMessageToMessageParam,
  verifyApiKey,
} from '../src/services/api/claude.js'

// ─── Message builders (used inside query.ts to build transcript entries) ─────
import {
  createUserMessage,
  createAssistantMessage,
  createSystemMessage,
  countToolCalls,
  hasSuccessfulToolCall,
  getLastAssistantMessage,
  hasToolCallsInLastAssistantTurn,
  INTERRUPT_MESSAGE,
  CANCEL_MESSAGE,
  REJECT_MESSAGE,
} from '../src/utils/messages.js'

// ─── Tool execution ──────────────────────────────────────────────────────────
import { runToolUse } from '../src/services/tools/toolExecution.js'

// ─── User input classification ───────────────────────────────────────────────
import { processUserInput } from '../src/utils/processUserInput/processUserInput.js'

// ─── Bootstrap state ─────────────────────────────────────────────────────────
import { getSessionId, getOriginalCwd, getTotalCostUSD } from '../src/bootstrap/state.js'

// ─── Config (must be unlocked before any config reads) ───────────────────────
import { enableConfigs } from '../src/utils/config.js'

// ─── Model utilities ─────────────────────────────────────────────────────────
import { getRuntimeMainLoopModel, renderModelName } from '../src/utils/model/model.js'

console.log('=== QueryEngine Debug ===\n')

// Must be called before any function that reads ~/.claude/settings.json
// (e.g. getAPIMetadata, verifyApiKey, getGlobalConfig).
// The real CLI calls this during startup in src/entrypoints/cli.tsx.
enableConfigs()

// ──────────────────────────────────────────────────────────────────────────────
// 1. Functions loaded — verify they're all real callables
// ──────────────────────────────────────────────────────────────────────────────
console.log('── 1. Loaded functions ──')
const fns = {
  'query (agentic loop entry)':     query,
  'ask (REPL-level entry)':         ask,
  'QueryEngine (class)':            QueryEngine,
  'runToolUse':                     runToolUse,
  'processUserInput':               processUserInput,
  'createUserMessage':              createUserMessage,
  'createAssistantMessage':         createAssistantMessage,
  'createSystemMessage':            createSystemMessage,
  'getAPIMetadata':                 getAPIMetadata,
  'verifyApiKey':                   verifyApiKey,
  'buildSystemPromptBlocks':        buildSystemPromptBlocks,
  'userMessageToMessageParam':      userMessageToMessageParam,
  'assistantMessageToMessageParam': assistantMessageToMessageParam,
  'countToolCalls':                 countToolCalls,
  'hasSuccessfulToolCall':          hasSuccessfulToolCall,
  'getLastAssistantMessage':        getLastAssistantMessage,
  'getSessionId':                   getSessionId,
  'getRuntimeMainLoopModel':        getRuntimeMainLoopModel,
  'renderModelName':                renderModelName,
}
for (const [name, fn] of Object.entries(fns)) {
  console.log(`  ${typeof fn === 'function' || (typeof fn === 'object' && fn !== null) ? '✓' : '✗'} ${name}`)
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. API metadata — what the real build sends as request headers
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── 2. API metadata (sent as x-* headers) ──')
const meta = getAPIMetadata()
console.log(JSON.stringify(meta, null, 2))

// ──────────────────────────────────────────────────────────────────────────────
// 3. Model capabilities
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── 3. Model capabilities ──')
const models = [
  'claude-opus-4-5',
  'claude-sonnet-4-5',
  'claude-haiku-4-5',
  'claude-3-5-haiku-20241022',
]
for (const model of models) {
  const maxTokens      = getMaxOutputTokensForModel(model)
  const cacheEnabled   = getPromptCachingEnabled(model)
  const displayName    = renderModelName(model)
  console.log(`  ${model}`)
  console.log(`    displayName   = "${displayName}"`)
  console.log(`    maxOutputTok  = ${maxTokens.toLocaleString()}`)
  console.log(`    promptCaching = ${cacheEnabled}`)
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. Message structure — what transcript entries look like
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── 4. Message structure ──')

const userMsg = createUserMessage({
  content: [{ type: 'text', text: 'list all files in the current directory' }],
})
console.log('\nuserMessage (what gets pushed to messages[]):')
console.log(`  type: ${userMsg.type}`)
console.log(`  uuid: ${userMsg.uuid}`)
console.log(`  content[0].type: ${userMsg.message.content[0]?.type}`)
console.log(`  content[0].text: "${(userMsg.message.content[0] as { type: 'text', text: string })?.text}"`)

const assistantMsg = createAssistantMessage({
  content: [
    { type: 'text', text: 'I will list the files for you.' } as any,
    {
      type: 'tool_use',
      id: 'toolu_01abc',
      name: 'Bash',
      input: { command: 'ls -la' },
    } as any,
  ],
  usage: { input_tokens: 42, output_tokens: 18 } as any,
})
console.log('\nassistantMessage with a tool_use block:')
console.log(`  type: ${assistantMsg.type}`)
console.log(`  uuid: ${assistantMsg.uuid}`)
console.log(`  content blocks: ${assistantMsg.message.content.length}`)
console.log(`    [0] type=${assistantMsg.message.content[0]?.type}`)
console.log(`    [1] type=${assistantMsg.message.content[1]?.type}  name=${(assistantMsg.message.content[1] as any)?.name}`)

// ──────────────────────────────────────────────────────────────────────────────
// 5. Transcript analysis helpers
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── 5. Transcript analysis helpers ──')
const transcript = [userMsg, assistantMsg]
console.log(`messages.length: ${transcript.length}`)
console.log(`countToolCalls(transcript): ${countToolCalls(transcript)}`)
console.log(`hasSuccessfulToolCall(transcript): ${hasSuccessfulToolCall(transcript)}`)
console.log(`hasToolCallsInLastAssistantTurn(transcript): ${hasToolCallsInLastAssistantTurn(transcript)}`)
const lastAssistant = getLastAssistantMessage(transcript)
console.log(`getLastAssistantMessage: type=${lastAssistant?.type ?? 'null'}  stop_reason=${lastAssistant?.message.stop_reason}`)

// ──────────────────────────────────────────────────────────────────────────────
// 6. System prompt building — what gets sent as the "system" field
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── 6. System prompt blocks ──')
const sysBlocks = buildSystemPromptBlocks([
  'You are a helpful coding assistant.',
  'You are running in debug mode.',
])
console.log(`buildSystemPromptBlocks([...]) → ${sysBlocks.length} block(s):`)
for (const b of sysBlocks) {
  const text = (b as { text?: string }).text ?? '(non-text block)'
  console.log(`  type=${b.type}  text="${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`)
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. Wire-format conversion — what gets sent to the Anthropic API
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── 7. API wire format ──')
const wireUser = userMessageToMessageParam(userMsg)
console.log('userMessageToMessageParam(userMsg):')
console.log(`  role: ${wireUser.role}`)
console.log(`  content: ${JSON.stringify(wireUser.content).slice(0, 100)}`)

const wireAssistant = assistantMessageToMessageParam(assistantMsg)
console.log('assistantMessageToMessageParam(assistantMsg):')
console.log(`  role: ${wireAssistant.role}`)
console.log(`  content[0].type: ${(wireAssistant.content as Array<{ type: string }>)[0]?.type}`)
console.log(`  content[1].type: ${(wireAssistant.content as Array<{ type: string }>)[1]?.type}`)

// ──────────────────────────────────────────────────────────────────────────────
// 8. Bootstrap session state
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── 8. Bootstrap session state ──')
console.log(`sessionId:    ${getSessionId()}`)
console.log(`originalCwd:  ${getOriginalCwd()}`)
console.log(`totalCostUSD: $${getTotalCostUSD().toFixed(6)}`)

// ──────────────────────────────────────────────────────────────────────────────
// 9. Interrupt / cancellation message constants
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── 9. Well-known message constants ──')
console.log(`INTERRUPT_MESSAGE: "${INTERRUPT_MESSAGE}"`)
console.log(`CANCEL_MESSAGE:    "${CANCEL_MESSAGE}"`)
console.log(`REJECT_MESSAGE:    "${REJECT_MESSAGE}"`)

// ──────────────────────────────────────────────────────────────────────────────
// 10. QueryParams shape — the struct passed to query() / ask()
//     This is the best breakpoint anchor: set a BP on `query(params)` below
//     and inspect the full params object to understand the query context.
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── 10. QueryParams shape ──')
console.log('The struct passed to query() — set a breakpoint on the query() call below')
console.log('to inspect it live when ANTHROPIC_API_KEY is set.\n')

// Show the required fields
const paramKeys: Array<keyof QueryParams> = [
  'messages',
  'systemPrompt',
  'userContext',
  'systemContext',
  'canUseTool',
  'toolUseContext',
  'querySource',
  // optional:
  'fallbackModel',
  'maxOutputTokensOverride',
  'maxTurns',
  'taskBudget',
  'deps',
]
console.log('QueryParams fields:')
for (const key of paramKeys) {
  const optional = ['fallbackModel', 'maxOutputTokensOverride', 'maxTurns', 'taskBudget', 'deps', 'skipCacheWrite'].includes(key)
  console.log(`  ${optional ? '?' : ' '} ${key}`)
}

// ──────────────────────────────────────────────────────────────────────────────
// 11. Optional: make a real API call
//     Set ANTHROPIC_API_KEY to run this — otherwise it prints instructions.
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n── 11. Live API call ──')

if (!process.env.ANTHROPIC_API_KEY) {
  console.log('  ℹ  ANTHROPIC_API_KEY not set — skipping live call.')
  console.log('  To run a real query, set it and rerun:')
  console.log('    ANTHROPIC_API_KEY=sk-ant-... bun debug/explore-query.ts')
  console.log()
  console.log('  Or launch "QueryEngine (prompt → LLM loop)" from VS Code Run & Debug.')
  console.log('  That config uses the Bun debugger so you can step through queryLoop().')
} else {
  console.log('  ANTHROPIC_API_KEY detected — would call verifyApiKey() here.')
  console.log('  (Skipped to avoid side-effects in this script — add your own call below)')
  // Uncomment to test key validity:
  // const valid = await verifyApiKey(process.env.ANTHROPIC_API_KEY)
  // console.log('  key valid:', valid)
}

console.log('\n=== Done ===')
