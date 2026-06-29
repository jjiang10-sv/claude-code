// Stub for @anthropic-ai/mcpb — internal Anthropic package for MCP binary
// (.dxt/.mcpb) plugin format. Not available on public npm.

import { z } from 'zod'

export interface McpUserConfigurationOption {
  key: string
  name: string
  description?: string
  type: 'string' | 'number' | 'boolean'
  required?: boolean
  default?: string | number | boolean
}

export type McpbUserConfigurationOption = McpUserConfigurationOption

export interface McpbManifest {
  name: string
  version: string
  description?: string
  server?: {
    type: 'stdio' | 'http'
    command?: string
    args?: string[]
  }
  userConfiguration?: McpbUserConfigurationOption[]
}

export const McpbManifestSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  server: z.object({
    type: z.enum(['stdio', 'http']),
    command: z.string().optional(),
    args: z.array(z.string()).optional(),
  }).optional(),
  userConfiguration: z.array(z.object({
    key: z.string(),
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(['string', 'number', 'boolean']),
    required: z.boolean().optional(),
    default: z.union([z.string(), z.number(), z.boolean()]).optional(),
  })).optional(),
})

export function getMcpConfigForManifest(_manifest: McpbManifest, _userValues: Record<string, unknown>): unknown {
  throw new Error('@anthropic-ai/mcpb is not available in this build')
}
