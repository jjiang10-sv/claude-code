// Shim for bun:bundle — at build time, Bun replaces feature() calls with
// boolean literals for dead-code elimination. This stub makes all features
// return false during dev/typecheck, disabling optional subsystems like
// COORDINATOR_MODE and KAIROS so the core paths remain explorable.
export function feature(name: string): boolean {
  if (['COORDINATOR_MODE', 'AGENT_TRIGGERS', 'AGENT_TRIGGERS_REMOTE', 'BUILDING_CLAUDE_APPS'].includes(name)) {
    return true
  }

  if (['DUMP_SYSTEM_PROMPT'].includes(name)) {
    return true
  }

  return false
}
