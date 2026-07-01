// Stub types for @ant/computer-use-mcp/types
import type { ComputerExecutor } from './index.js'

export type CoordinateMode = 'pixels' | 'normalized'

export interface CuSubGates {
  pixelValidation: boolean
  clipboardPasteMultiline: boolean
  mouseAnimation: boolean
  hideBeforeAction: boolean
  autoTargetDisplay: boolean
  clipboardGuard: boolean
}

export interface Logger {
  silly(message: string, ...args: unknown[]): void
  debug(message: string, ...args: unknown[]): void
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
}

export interface ComputerUseHostAdapter {
  executor: ComputerExecutor
}

export const DEFAULT_GRANT_FLAGS = {
  clipboardRead: false,
  clipboardWrite: false,
  systemKeyCombos: false,
}
