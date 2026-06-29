// Stub for @anthropic-ai/sandbox-runtime — internal package for sandboxed
// code execution with filesystem/network restrictions. Not available on public npm.

import { z } from 'zod'

export interface NetworkHostPattern {
  host: string
  port?: number
}

export interface NetworkRestrictionConfig {
  mode: 'allowlist' | 'denylist'
  patterns?: NetworkHostPattern[]
}

export interface FsReadRestrictionConfig {
  allowedPaths?: string[]
  deniedPaths?: string[]
}

export interface FsWriteRestrictionConfig {
  allowedPaths?: string[]
  deniedPaths?: string[]
}

export interface IgnoreViolationsConfig {
  network?: boolean
  fsRead?: boolean
  fsWrite?: boolean
}

export interface SandboxViolationEvent {
  type: 'network' | 'fsRead' | 'fsWrite'
  path?: string
  host?: string
  timestamp: number
}

export type SandboxAskCallback = (_event: SandboxViolationEvent) => Promise<boolean>
export type SandboxDependencyCheck = () => Promise<{ available: boolean; reason?: string }>

export interface SandboxRuntimeConfig {
  network?: NetworkRestrictionConfig
  fsRead?: FsReadRestrictionConfig
  fsWrite?: FsWriteRestrictionConfig
  ignoreViolations?: IgnoreViolationsConfig
}

export const SandboxRuntimeConfigSchema = z.object({
  network: z.object({
    mode: z.enum(['allowlist', 'denylist']),
    patterns: z.array(z.object({
      host: z.string(),
      port: z.number().optional(),
    })).optional(),
  }).optional(),
  fsRead: z.object({
    allowedPaths: z.array(z.string()).optional(),
    deniedPaths: z.array(z.string()).optional(),
  }).optional(),
  fsWrite: z.object({
    allowedPaths: z.array(z.string()).optional(),
    deniedPaths: z.array(z.string()).optional(),
  }).optional(),
})

export class SandboxViolationStore {
  getViolations(): SandboxViolationEvent[] { return [] }
  addViolation(_event: SandboxViolationEvent): void {}
  clear(): void {}
}

export class SandboxManager {
  constructor(_config: SandboxRuntimeConfig) {}
  async start(): Promise<void> { throw new Error('@anthropic-ai/sandbox-runtime is not available') }
  async stop(): Promise<void> {}
  getViolations(): SandboxViolationEvent[] { return [] }
}
