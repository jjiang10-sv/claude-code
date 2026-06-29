// Stub for color-diff-napi — internal Anthropic native module for color diffing.
export function diff(_a: unknown, _b: unknown): unknown { return null }
export class ColorDiff {
  static diff(_a: unknown, _b: unknown): unknown { return null }
}
export class ColorFile {
  constructor(_content: unknown, _theme?: unknown) {}
  getLines(): unknown[] { return [] }
}
export type SyntaxTheme = Record<string, unknown>
export function getSyntaxTheme(_name?: string): SyntaxTheme { return {} }
export function getColorModuleUnavailableReason(): string {
  return 'color-diff-napi is not available in this build'
}
export default { diff, ColorDiff, ColorFile, getSyntaxTheme, getColorModuleUnavailableReason }
