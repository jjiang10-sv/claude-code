// Stub for @ant/claude-for-chrome-mcp — internal package for Claude-in-Chrome
// browser extension integration. Not available on public npm.

export type PermissionMode = 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'

export interface Logger {
  silly(message: string, ...args: unknown[]): void
  debug(message: string, ...args: unknown[]): void
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
}

export interface ClaudeForChromeContext {
  getSocketPaths(): string[]
}

export const BROWSER_TOOLS: string[] = []

export function createClaudeForChromeMcpServer(_options: unknown): never {
  throw new Error('@ant/claude-for-chrome-mcp is not available in this build')
}
