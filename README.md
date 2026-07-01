# Claude Code's Entire Source Code Got Leaked via a Sourcemap in npm, Let's Talk About It

> **PS:** This breakdown is also available on [this blog](https://kuber.studio/blog/AI/Claude-Code's-Entire-Source-Code-Got-Leaked-via-a-Sourcemap-in-npm,-Let's-Talk-About-it) with a better reading experience and UX :)

> **Note:** There's a non-zero chance this repo might be taken down. If you want to play around with it later or archive it yourself, feel free to **fork it** and bookmark the external blog link!

---

## ⚠️ Important Disclaimer

**I did not leak these files.** I have simply provided an easy, documented way to access and study this codebase for research purposes. All files and information originate from public findings shared on Twitter/X. All credit for the discovery goes to the original source.

---

Earlier today (March 31st, 2026) - **Chaofan Shou (@Fried_rice)** discovered something that Anthropic probably didn't want the world to see: the **entire source code** of Claude Code, Anthropic's official AI coding CLI, was sitting in plain sight on the npm registry via a sourcemap file bundled into the published package.

[![The tweet announcing the leak](assets/x-post.png)](https://x.com/Fried_rice/status/2038894956459290963)

This repository is a backup of that leaked source, providing a full breakdown of what's in it, how the leak happened, and the internal systems that were never meant to be public.

---

## 🧐 How Did This Even Happen?

When you publish a JavaScript/TypeScript package to npm, the build toolchain often generates **source map files** (`.map` files). These files bridge minified production code and the original source for debugging.

The catch? **Source maps contain the original source code** embedded as strings inside a JSON file under the `sourcesContent` key.

```json
{
  "version": 3,
  "sources": ["../src/main.tsx", "../src/tools/BashTool.ts", "..."],
  "sourcesContent": ["// The ENTIRE original source code of each file", "..."],
  "mappings": "AAAA,SAAS,OAAO..."
}
```

By forgetting to add `*.map` to `.npmignore` or failing to disable source maps in production builds (Bun's default behavior), the entire raw source was shipped to the npm registry.

[![Claude Code source files exposed in npm package](assets/claude-npm-img.png)](assets/claude-npm-img.png)

---

## 🛠 What's Under the Hood?

Claude Code is not just a simple CLI. It's a massive **785KB `main.tsx`** entry point featuring a custom React terminal renderer (Ink), 40+ tools, and complex multi-agent orchestration.

### 🐣 BUDDY - The Terminal Tamagotchi
Inside [`src/buddy/`](./src/buddy/), there is a full **Tamagotchi-style companion system**.
- **Deterministic Gacha:** Uses a Mulberry32 PRNG seeded from your `userId`.
- **18 Species:** Ranging from Common (*Pebblecrab*) to Legendary (*Nebulynx*).
- **Stats & Souls:** Every buddy has stats like `DEBUGGING`, `CHAOS`, and `SNARK`, with a "soul" description written by Claude.

### 🕵️‍♂️ Undercover Mode - "Do Not Blow Your Cover"
Anthropic employees use Claude Code to contribute to public repos. **Undercover Mode** ([`src/utils/undercover.ts`](./src/utils/undercover.ts)) prevents the AI from leaking internal info:
- Blocks internal model codenames (e.g., *Capybara*, *Tengu*).
- Hides the fact that the user is an AI.
- Confirms that **"Tengu"** is likely the internal codename for Claude Code.

### 🌙 The "Dream" System
Claude Code "dreams" to consolidate memory. The **autoDream** service ([`src/services/autoDream/`](./src/services/autoDream/)) runs as a background subagent to:
1. **Orient:** Read `MEMORY.md`.
2. **Gather:** Find new signals from daily logs.
3. **Consolidate:** Update durable memory files.
4. **Prune:** Keep context efficient.

### 🚀 KAIROS & ULTRAPLAN
- **KAIROS:** An "always-on" proactive assistant that watches logs and acts without waiting for input.
- **ULTRAPLAN:** Offloads complex tasks to a remote **Opus 4.6** session for up to 30 minutes of deep planning.

---

## 📂 Architecture & Directory Structure

```text
src/
├── main.tsx                 # CLI Entrypoint (Commander.js + React/Ink)
├── QueryEngine.ts           # Core LLM logic
├── Tool.ts                  # Base tool definitions
├── tools/                   # 40+ Agent tools (Bash, Files, LSP, Web)
├── services/                # Backend (MCP, OAuth, Analytics, Dreams)
├── coordinator/             # Multi-agent orchestration (Swarm)
├── bridge/                  # IDE Integration layer
└── buddy/                   # The secret Tamagotchi system
```

---

## ⚙️ How to Use & Explore

### 📦 Prerequisites
- **[Bun Runtime](https://bun.sh)** (Highly Recommended) or Node.js v18+
- **TypeScript** installed globally

### 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/claude-leaked.git
    cd claude-leaked
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Build the Project:**
    ```bash
    npm run build
    ```

4.  **Run the CLI:**
    ```bash
    node dist/main.js
    ```

### 🔍 Explore with MCP
This repo includes an **MCP Server** to let you explore the source using Claude itself:
```bash
claude mcp add code-explorer -- npx -y claude-code-explorer-mcp
```

---

## 📈 SEO & Rankings
**Keywords:** `Claude Code Leak`, `Anthropic Source Code`, `AI Agent Framework`, `Claude 3.5 Sonnet CLI`, `Tengu Anthropic`, `npm sourcemap leak`, `Open Source AI Agent`.

---

## 📜 Credits & Legal

- **Discovery:** [Chaofan Shou (@Fried_rice)](https://x.com/Fried_rice)
- **Source Post:** [Twitter/X Announcement](https://x.com/Fried_rice/status/2038894956459290963)
- **Author of this Mirror:** [Yasas Banu](https://www.yasasbanuka.tech)

**Disclaimer:** All original source code is the proprietary property of **Anthropic PBC**. This repository is for educational and archival purposes only. **This is not an official Anthropic product.**

---

### 📩 Contact
For spamming reasons the email has been removed.

---

## 🔧 Local Development Setup — Making the Source Runnable

The source code as-leaked is **not immediately runnable** from this directory. Several build-time patches and configuration changes are required because:

1. Internal Anthropic dependencies are **not published** to the public npm registry.
2. The Bun bundler's `MACRO.*` constants are injected only during Anthropic's internal CI build — they're absent in a local build.
3. The React/Ink reconciler used here is written for React 19, but relies on a hook (`useEffectEvent`) that Bun doesn't wire up correctly, causing a runtime crash.

The following files were modified and why each change was necessary.

---

### Modified Files

#### `build.ts` *(New file — custom build + post-processing script)*

This is the core of the local dev setup. It runs `Bun.build()` to bundle `src/entrypoints/cli.tsx` into `dist/main.js`, then applies three sequential post-build patches to the output.

| Patch | What It Does | Why It's Necessary |
|---|---|---|
| **Patch 1 — `useEffectEvent` shim** | Replaces `React.__SECRET_INTERNALS...readContext` delegation for `useEffectEvent` with a direct ref + callback implementation | The Ink terminal renderer calls `useEffectEvent` (a React 19 API), but the bundled React dispatcher doesn't expose it correctly in a non-embedded Bun runtime, causing an immediate `TypeError` on startup |
| **Patch 2 — `SandboxManager` stub** | Replaces the minimal auto-generated `SandboxManager` stub (only had `start()`/`stop()`) with a full no-op implementation of all static and instance methods | `@anthropic-ai/sandbox-runtime` is an internal Anthropic private package — it cannot be `npm install`-ed. The bundle collapses it to an empty stub missing `isSupportedPlatform()`, `checkDependencies()`, etc., which crashes immediately at startup |
| **Patch 3 — Ripgrep vendor symlink** | Creates `dist/vendor/ripgrep/arm64-darwin/rg` as a symlink to the system `rg` binary | When `isInBundledMode()` returns `false` (i.e., running via `bun dist/main.js` without embedded files), the code falls back to looking for a vendored ripgrep at a hardcoded path that doesn't exist in the local repo |

The `define` map also injects all `MACRO.*` constants (version strings, package URLs, etc.) that Anthropic's internal build pipeline normally injects:

```ts
define: {
  'MACRO.VERSION': '"2.1.181-dev"',
  'MACRO.BUILD_TIME': '"2026-07-01T00:00:00Z"',
  'MACRO.FEEDBACK_CHANNEL': '"#claude-code-feedback"',
  'MACRO.PACKAGE_URL': '"@anthropic-ai/claude-code"',
  'MACRO.NATIVE_PACKAGE_URL': '"@anthropic-ai/claude-code"',
  'MACRO.ISSUES_EXPLAINER': '"visit https://github.com/anthropics/claude-code/issues"',
  'MACRO.VERSION_CHANGELOG': '""',
}
```

Without these, any code path that reads `MACRO.PACKAGE_URL` (e.g., the auto-updater) would throw `ReferenceError: MACRO is not defined` at runtime.

---

#### `package.json` — Pinned `commander` version

**Change:** Added `"commander": "^13.0.0"` as an explicit dependency.

**Why:** Bun's dependency resolution was hoisting an older version of `commander` (v11/v12) from a transitive dependency. The older version's `Command` prototype is missing `configureHelp()`, which the CLI calls during startup — causing an immediate crash. Pinning to v13 ensures the correct API is always resolved.

---

#### `stubs/bun-bundle.ts` — Enabled `COORDINATOR_MODE` feature gate

**Change:** Modified the `getFeatureFlag` stub to return `true` for `COORDINATOR_MODE` when `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=true` is set in the environment.

**Why:** The agent swarm tools (`TeamCreate`, `TeamDelete`, `Agent`, `SendMessage`) are gated behind the `COORDINATOR_MODE` feature flag. In Anthropic's production build, this flag is controlled by a remote GrowthBook feature-flag service. That service is not accessible in the local dev environment, so the flag must be hard-coded to `true` locally to unlock the swarm toolset.

---

#### `src/main.tsx` — Registered `--agent-teams` CLI option

**Change:** Added registration of the `--agent-teams` boolean option on the Commander program when `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` is set.

**Why:** The production binary had this option stripped/gated behind an internal build flag. Without registering it, Commander throws `error: unknown option '--agent-teams'` and exits immediately.

---

#### `src/entrypoints/cli.tsx` — Removed runtime `useEffectEvent` shim

**Change:** Removed an earlier attempt at a runtime React shim that was placed here during debugging.

**Why:** The runtime approach was unreliable because the shim ran *after* the React renderer was already initialized. Moving the fix to the build-time patch in `build.ts` (Patch 1 above) is more robust and predictable.

---

### System Prerequisites

Before building, ensure the following are installed on your machine:

```bash
# Bun runtime (required — Node.js alone won't work for this build script)
curl -fsSL https://bun.sh/install | bash

# ripgrep (required for file search tools inside the CLI)
brew install ripgrep
```

---

### Running the CLI Locally

```bash
# Build (applies all patches automatically)
bun run build

# Run with agent swarm mode enabled
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=true bun dist/main.js

# Or in print (non-interactive) mode to test a single prompt
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=true bun dist/main.js -p "list the tools you have available"
```

The build script is idempotent — you can re-run `bun run build` any time you change source files and the patches will be re-applied cleanly.

