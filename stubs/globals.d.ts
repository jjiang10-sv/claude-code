// Markdown files imported as raw string modules (Bun handles this natively).
declare module '*.md' {
  const content: string
  export default content
}

// Bun macro identifier — resolved at compile time by `bun build`.
// MACRO is used both as a call (MACRO(...)) and to access build-time constants
// like MACRO.VERSION.
declare const MACRO: {
  (...args: any[]): any
  VERSION: string
  [key: string]: any
}

// Bun build-time constant injected by build scripts
declare const __BUILD_VERSION__: string | undefined
declare const __BUILD_COMMIT__: string | undefined
