const result = await Bun.build({
  entrypoints: ['./src/entrypoints/cli.tsx'],
  outdir: './dist',
  target: 'node',
  naming: {
    entry: 'main.js'
  },
  define: {
    'MACRO.VERSION': '"2.1.181-dev"',
    'MACRO.BUILD_TIME': '"2026-07-01T00:00:00Z"',
    'MACRO.FEEDBACK_CHANNEL': '"#claude-code-feedback"',
    'MACRO.PACKAGE_URL': '"@anthropic-ai/claude-code"',
    'MACRO.NATIVE_PACKAGE_URL': '"@anthropic-ai/claude-code"',
    'MACRO.ISSUES_EXPLAINER': '"visit https://github.com/anthropics/claude-code/issues"',
    'MACRO.VERSION_CHANGELOG': '""',
  },
  plugins: [
    {
      name: 'stub-missing-files',
      setup(build) {
        build.onResolve({ filter: /dream\.js$|hunter\.js$|runSkillGenerator\.js$|prompt\.txt$|auto_mode_system_prompt\.txt$|permissions_external\.txt$|permissions_anthropic\.txt$/ }, args => {
          return { path: args.path, namespace: 'stub' };
        });
        
        build.onLoad({ filter: /.*/, namespace: 'stub' }, args => {
          let contents = 'export default "";';
          if (args.path.includes('dream')) {
            contents = 'export function registerDreamSkill() {}';
          } else if (args.path.includes('hunter')) {
            contents = 'export function registerHunterSkill() {}';
          } else if (args.path.includes('runSkillGenerator')) {
            contents = 'export function registerRunSkillGeneratorSkill() {}';
          }
          return {
            contents,
            loader: 'js',
          };
        });
      }
    }
  ],
  external: [
    'audio-capture-napi',
    'color-diff-napi',
    'image-processor-napi',
    'url-handler-napi',
    'modifiers-napi',
    'sharp'
  ]
});

if (!result.success) {
  console.error('Build failed');
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}
console.log('Build succeeded');

import fs from 'node:fs';
const mainJsPath = './dist/main.js';
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

// Patch 1: useEffectEvent shim (React 19 / Ink reconciler compatibility)
{
  const target = `    exports.useEffectEvent = function(callback) {
      return resolveDispatcher().useEffectEvent(callback);
    };`;
  const replacement = `    exports.useEffectEvent = function(callback) {
      var ref = exports.useRef(callback);
      ref.current = callback;
      return exports.useCallback(function() {
        return ref.current.apply(null, arguments);
      }, []);
    };`;
  if (mainJs.includes(target)) {
    mainJs = mainJs.replace(target, replacement);
    console.log('Patched: useEffectEvent');
  } else {
    console.warn('Could not find target: useEffectEvent');
  }
}

// Patch 2: SandboxManager stub — @anthropic-ai/sandbox-runtime is not installed.
// The bundler emits a minimal stub that only has start()/stop(). The sandbox-adapter
// calls static methods (isSupportedPlatform, checkDependencies, etc.) that are missing.
// We replace the stub class with a full no-op implementation that returns safe defaults.
{
  const target = `class SandboxManager {
  constructor(_config) {}
  async start() {
    throw new Error("@anthropic-ai/sandbox-runtime is not available");
  }
  async stop() {}
  getViolations() {
    return [];
  }
}`;
  const replacement = `class SandboxManager {
  constructor(_config) {}
  async start() {}
  async stop() {}
  getViolations() { return []; }
  static isSupportedPlatform() { return false; }
  static checkDependencies() { return { errors: [], warnings: [] }; }
  static async initialize() {}
  static updateConfig() {}
  static async reset() {}
  static wrapWithSandbox(cmd) { return cmd; }
  static cleanupAfterCommand() {}
  static getFsReadConfig() { return { allowOnly: [], denyWithinAllow: [] }; }
  static getFsWriteConfig() { return { allowOnly: [], denyWithinAllow: [] }; }
  static getNetworkRestrictionConfig() { return { allowedDomains: [], deniedDomains: [] }; }
  static getIgnoreViolations() { return undefined; }
  static getAllowUnixSockets() { return undefined; }
  static getAllowLocalBinding() { return undefined; }
  static getEnableWeakerNestedSandbox() { return undefined; }
  static getProxyPort() { return undefined; }
  static getSocksProxyPort() { return undefined; }
  static getLinuxHttpSocketPath() { return undefined; }
  static getLinuxSocksSocketPath() { return undefined; }
  static async waitForNetworkInitialization() { return false; }
  static getSandboxViolationStore() { return new SandboxViolationStore(); }
  static annotateStderrWithSandboxFailures(_cmd, stderr) { return stderr; }
}`;
  if (mainJs.includes(target)) {
    mainJs = mainJs.replace(target, replacement);
    console.log('Patched: SandboxManager stub');
  } else {
    console.warn('Could not find target: SandboxManager stub (may have changed)');
  }
}

fs.writeFileSync(mainJsPath, mainJs, 'utf8');
console.log('Build post-processing complete.');

// Patch 3: Create vendor/ripgrep symlink so the bundle can find rg at the expected path.
// When not in bundled mode, the getRipgrepConfig() function looks for:
//   dist/vendor/ripgrep/{arch}-{platform}/rg
// We create a symlink to the system rg to satisfy this.
import { execSync } from 'node:child_process';
try {
  const rgPath = execSync('which rg', { encoding: 'utf8' }).trim();
  if (rgPath) {
    const arch = process.arch;
    const platform = process.platform;
    const vendorDir = `./dist/vendor/ripgrep/${arch}-${platform}`;
    fs.mkdirSync(vendorDir, { recursive: true });
    const linkTarget = `${vendorDir}/rg`;
    try { fs.unlinkSync(linkTarget); } catch {}
    fs.symlinkSync(rgPath, linkTarget);
    console.log(`Created vendor ripgrep symlink: ${linkTarget} -> ${rgPath}`);
  }
} catch (e) {
  console.warn('Could not create vendor ripgrep symlink:', (e as Error).message);
}

