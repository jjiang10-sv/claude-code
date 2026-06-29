// Shim for bun:bundle — at build time, Bun replaces feature() calls with
// boolean literals for dead-code elimination. This stub makes all features
// return false during dev/typecheck, disabling optional subsystems like
// COORDINATOR_MODE and KAIROS so the core paths remain explorable.
export function feature(_name: string): boolean {
  return false
}
