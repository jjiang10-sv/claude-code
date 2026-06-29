/**
 * Debug: AgentTool — how Claude spawns sub-agents
 *
 * When the model calls the "Task" tool (AgentTool), Claude Code:
 *   1. Spins up a new sub-agent with its own context and tool set
 *   2. Runs it to completion (or in parallel via async tasks)
 *   3. Returns the result to the parent agent
 *
 * The flow:
 *   Model emits tool_use { name: "Task", input: { prompt, ... } }
 *     → executeToolCall()                src/services/tools/toolExecution.ts
 *         → AgentTool.call()             src/tools/AgentTool/AgentTool.tsx:196
 *             → runAgent()               src/tools/AgentTool/runAgent.ts:248
 *                 → registers as LocalAgentTask or RemoteAgentTask
 *                 → runs query loop (same as main loop, recursively)
 *
 * Good breakpoints:
 *   src/tools/AgentTool/AgentTool.tsx:196  — AgentTool definition
 *   src/tools/AgentTool/runAgent.ts:248    — runAgent() — the sub-agent loop
 *   src/tasks/LocalAgentTask/LocalAgentTask.ts — task lifecycle management
 *   src/tools/AgentTool/loadAgentsDir.ts   — how agent definitions are loaded
 *
 * Also interesting:
 *   src/utils/agentSwarmsEnabled.ts    — feature flag for parallel agents
 *   src/coordinator/coordinatorMode.ts — multi-agent coordination (COORDINATOR_MODE)
 */

// AgentTool definition
import { AgentTool } from '../src/tools/AgentTool/AgentTool.js'

// The actual sub-agent runner
import { runAgent } from '../src/tools/AgentTool/runAgent.js'

// How agent definitions (custom agents via .claude/agents/) are loaded
import { loadAgentsDir } from '../src/tools/AgentTool/loadAgentsDir.js'

// Built-in agent definitions (e.g. the default sub-agent config)
import { getBuiltInAgents } from '../src/tools/AgentTool/builtInAgents.js'

console.log('=== AgentTool / Sub-agents Debug ===')
console.log()
console.log('AgentTool name:', AgentTool.name)
const descVal = typeof AgentTool.description === 'function' ? '(async function)' : String(AgentTool.description ?? '').slice(0, 80) + '...'
console.log('AgentTool description:', descVal)
console.log()

// Built-in agents
const builtIn = getBuiltInAgents()
console.log(`Built-in agent definitions: ${builtIn.length}`)
for (const a of builtIn) {
  console.log(`  - ${(a as any).agentType ?? a.name}: ${((a as any).whenToUse ?? '').slice(0, 60)}`)
}

console.log()
console.log('Set breakpoints in:')
console.log('  src/tools/AgentTool/runAgent.ts:248  → runAgent()')
console.log('  src/tools/AgentTool/AgentTool.tsx    → AgentTool.call()')
console.log('  src/tasks/LocalAgentTask/LocalAgentTask.ts')
