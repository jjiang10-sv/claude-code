// Stub for @ant/computer-use-mcp — internal Anthropic package for computer
// control (screenshots, mouse, keyboard). Not available on public npm.
// These no-op stubs satisfy TypeScript; actual computer-use features won't work.

export const API_RESIZE_PARAMS = { width: 1366, height: 768 } as const

export function targetImageSize(_displayGeometry: DisplayGeometry): { width: number; height: number } {
  return { width: 1366, height: 768 }
}

export function buildComputerUseTools(_options: unknown): unknown[] {
  return []
}

export function createComputerUseMcpServer(_options: unknown): never {
  throw new Error('@ant/computer-use-mcp is not available in this build')
}

export interface DisplayGeometry {
  width: number
  height: number
  scaleFactor: number
  displayId?: number
}

export interface ScreenshotResult {
  imageBase64: string
  width: number
  height: number
}

export interface FrontmostApp {
  bundleId: string
  name: string
  pid: number
}

export interface InstalledApp {
  bundleId: string
  name: string
  path: string
}

export interface RunningApp {
  bundleId: string
  name: string
  pid: number
}

export interface ResolvePrepareCaptureResult {
  displayGeometry: DisplayGeometry
}

export interface ComputerExecutor {
  screenshot(): Promise<ScreenshotResult>
  getFrontmostApp(): Promise<FrontmostApp>
  listInstalledApps(): Promise<InstalledApp[]>
  listRunningApps(): Promise<RunningApp[]>
  resolvePrepareCapture(_bundleId: string): Promise<ResolvePrepareCaptureResult>
}

export type CuPermissionRequest = any
export type CuPermissionResponse = any
export type CuCallToolResult = any
export type ComputerUseSessionContext = any
export type ScreenshotDims = any
export const DEFAULT_GRANT_FLAGS: any = {}
export function bindSessionContext(_ctx: any): any { return {} }
