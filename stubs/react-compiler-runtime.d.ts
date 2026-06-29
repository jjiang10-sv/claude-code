// Stub type declarations for react/compiler-runtime.
// The React compiler emits calls to `c()` from this module for memoization.
// This is an internal Anthropic build that uses the React compiler;
// the `c` export corresponds to useMemoCache from React's internals.
declare module 'react/compiler-runtime' {
  export function c(size: number): any[]
}
