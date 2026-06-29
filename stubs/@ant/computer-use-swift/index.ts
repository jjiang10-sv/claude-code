// Stub for @ant/computer-use-swift — internal Anthropic Swift/macOS package
// for screenshots and window management. Not available on public npm.

export interface ComputerUseAPI {
  captureExcluding(_allowedBundleIds: string[]): Promise<{ imageBase64: string; width: number; height: number }>
  captureRegion(_region: { x: number; y: number; width: number; height: number }): Promise<{ imageBase64: string }>
  apps: {
    listInstalled(): Promise<Array<{ bundleId: string; name: string; path: string }>>
  }
  resolvePrepareCapture(_bundleId: string): Promise<{ displayGeometry: { width: number; height: number; scaleFactor: number } }>
}

const stub: ComputerUseAPI = {
  captureExcluding: () => { throw new Error('@ant/computer-use-swift is not available') },
  captureRegion: () => { throw new Error('@ant/computer-use-swift is not available') },
  apps: {
    listInstalled: () => { throw new Error('@ant/computer-use-swift is not available') },
  },
  resolvePrepareCapture: () => { throw new Error('@ant/computer-use-swift is not available') },
}

export default stub
module.exports = stub
