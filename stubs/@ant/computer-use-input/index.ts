// Stub for @ant/computer-use-input — internal Anthropic Rust/enigo package
// for mouse and keyboard automation. Not available on public npm.

const stub = {
  mouseMove: (_x: number, _y: number): void => { throw new Error('@ant/computer-use-input is not available') },
  mouseClick: (_button: string): void => { throw new Error('@ant/computer-use-input is not available') },
  keyPress: (_key: string): void => { throw new Error('@ant/computer-use-input is not available') },
  typeText: (_text: string): void => { throw new Error('@ant/computer-use-input is not available') },
  getFrontmostApp: (): unknown => { throw new Error('@ant/computer-use-input is not available') },
}

export default stub
module.exports = stub
