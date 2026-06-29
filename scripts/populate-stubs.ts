/**
 * Populates critical stub files with `any`-typed exports so TypeScript
 * stops complaining about missing named exports.
 * Run with: bun scripts/populate-stubs.ts
 */
import { writeFileSync } from 'fs'
import { join, resolve } from 'path'

const ROOT = resolve(import.meta.dir, '..')
const SRC = join(ROOT, 'src')

const stubs: Record<string, string> = {
  'types/message.ts': `
export type Message = any
export type AssistantMessage = any
export type UserMessage = any
export type SystemMessage = any
export type SystemMessageLevel = any
export type ProgressMessage = any
export type NormalizedMessage = any
export type NormalizedAssistantMessage = any
export type NormalizedUserMessage = any
export type RenderableMessage = any
export type CollapsibleMessage = any
export type CollapsedReadSearchGroup = any
export type GroupedToolUseMessage = any
export type ToolUseSummaryMessage = any
export type AttachmentMessage = any
export type TombstoneMessage = any
export type HookResultMessage = any
export type StreamEvent = any
export type RequestStartEvent = any
export type StopHookInfo = any
export type MessageOrigin = any
export type PartialCompactDirection = any
export type CompactMetadata = any
export type SystemAPIErrorMessage = any
export type SystemBridgeStatusMessage = any
export type SystemCompactBoundaryMessage = any
export type SystemMicrocompactBoundaryMessage = any
export type SystemLocalCommandMessage = any
export type SystemMemorySavedMessage = any
export type SystemThinkingMessage = any
export type SystemTurnDurationMessage = any
export type SystemStopHookSummaryMessage = any
export type SystemInformationalMessage = any
export type SystemAgentsKilledMessage = any
export type SystemApiMetricsMessage = any
export type SystemAwaySummaryMessage = any
export type SystemPermissionRetryMessage = any
export type SystemScheduledTaskFireMessage = any
export type SystemFileSnapshotMessage = any
`,

  'types/tools.ts': `
export type ToolProgressData = any
export type BashProgress = any
export type ShellProgress = any
export type PowerShellProgress = any
export type MCPProgress = any
export type WebSearchProgress = any
export type AgentToolProgress = any
export type REPLToolProgress = any
export type SkillToolProgress = any
export type TaskOutputProgress = any
export type SdkWorkflowProgress = any
`,

  'types/notebook.ts': `
export type NotebookCellType = any
export type NotebookContent = any
export type NotebookCell = any
export type NotebookCellOutput = any
export type NotebookCellSource = any
export type NotebookCellSourceOutput = any
export type NotebookOutputImage = any
`,

  'types/utils.ts': `
export type DeepImmutable<T> = T
export type Permutations<T extends string = string> = any
`,

  'types/connectorText.ts': `
export type ConnectorTextBlock = any
export type ConnectorTextDelta = any
export function isConnectorTextBlock(_value: unknown): _value is ConnectorTextBlock { return false }
`,

  'types/messageQueueTypes.ts': `
export type QueueOperation = any
export type QueueOperationMessage = any
`,

  'types/statusLine.ts': `
export type StatusLineCommandInput = any
`,

  'types/fileSuggestion.ts': `
export type FileSuggestionCommandInput = any
`,

  'entrypoints/sdk/controlTypes.ts': `
export type SDKControlRequest = any
export type SDKControlResponse = any
export type SDKControlPermissionRequest = any
export type SDKControlCancelRequest = any
export type SDKControlInitializeRequest = any
export type SDKControlInitializeResponse = any
export type SDKControlMcpSetServersResponse = any
export type SDKControlReloadPluginsResponse = any
export type SDKControlRequestInner = any
export type SDKPartialAssistantMessage = any
export type StdinMessage = any
export type StdoutMessage = any
`,

  'entrypoints/sdk/runtimeTypes.ts': `
export type Options = any
export type InternalOptions = any
export type Query = any
export type InternalQuery = any
export type AnyZodRawShape = any
export type InferShape<T> = any
export type SDKSession = any
export type SDKSessionOptions = any
export type SessionMessage = any
export type SessionMutationOptions = any
export type ForkSessionOptions = any
export type ForkSessionResult = any
export type GetSessionInfoOptions = any
export type GetSessionMessagesOptions = any
export type ListSessionsOptions = any
export type McpSdkServerConfigWithInstance = any
export type SdkMcpToolDefinition = any
export type EffortLevel = any
`,

  'entrypoints/sdk/settingsTypes.generated.ts': `
export type Settings = any
`,

  'entrypoints/sdk/toolTypes.ts': `
export type {}
`,

  'entrypoints/sdk/sdkUtilityTypes.ts': `
export type NonNullableUsage<T> = T
`,

  'entrypoints/sdk/coreTypes.generated.ts': `
export type SDKMessage = any
export type SDKResultMessage = any
export type SDKResultSuccess = any
export type SDKSessionInfo = any
export type SDKUserMessage = any
export type SDKAssistantMessage = any
export type SDKAssistantMessageError = any
export type SDKCompactBoundaryMessage = any
export type SDKPartialAssistantMessage = any
export type SDKPermissionDenial = any
export type SDKRateLimitInfo = any
export type SDKStatus = any
export type SDKStatusMessage = any
export type SDKSystemMessage = any
export type SDKToolProgressMessage = any
export type SDKUserMessageReplay = any
export type ModelInfo = any
export type ModelUsage = any
export type McpServerConfigForProcessTransport = any
export type McpServerStatus = any
export type PermissionMode = any
export type PermissionResult = any
export type PermissionUpdate = any
export type HookInput = any
export type HookJSONOutput = any
export type AsyncHookJSONOutput = any
export type SyncHookJSONOutput = any
export type ApiKeySource = any
export type RewindFilesResult = any
export type BillingType = any
export type SubscriptionType = any
export type PreToolUseHookInput = any
export type PostToolUseHookInput = any
export type PostToolUseFailureHookInput = any
export type NotificationHookInput = any
export type SessionStartHookInput = any
export type SessionEndHookInput = any
export type StopHookInput = any
export type StopFailureHookInput = any
export type SubagentStartHookInput = any
export type SubagentStopHookInput = any
export type PreCompactHookInput = any
export type PostCompactHookInput = any
export type PermissionRequestHookInput = any
export type PermissionDeniedHookInput = any
export type SetupHookInput = any
export type TeammateIdleHookInput = any
export type TaskCreatedHookInput = any
export type TaskCompletedHookInput = any
export type ElicitationHookInput = any
export type ElicitationResultHookInput = any
export type ConfigChangeHookInput = any
export type CwdChangedHookInput = any
export type FileChangedHookInput = any
export type InstructionsLoadedHookInput = any
export type UserPromptSubmitHookInput = any
`,

  'constants/querySource.ts': `
export type QuerySource = string
export const QuerySource = {
  MAIN: 'main',
  SUBAGENT: 'subagent',
  API: 'api',
} as const
`,

  'services/oauth/types.ts': `
export type OAuthTokens = any
export type OAuthProfileResponse = any
export type OAuthTokenExchangeResponse = any
export type BillingType = any
export type SubscriptionType = any
export type ReferralCampaign = any
export type ReferralEligibilityResponse = any
export type ReferralRedemptionsResponse = any
export type ReferrerRewardInfo = any
export type UserRolesResponse = any
`,

  'services/lsp/types.ts': `
export type LspServerConfig = any
export type LspServerState = any
export type ScopedLspServerConfig = any
`,

  'utils/secureStorage/types.ts': `
export type SecureStorage = any
export type SecureStorageData = any
`,

  'keybindings/types.ts': `
export type KeybindingAction = any
export type KeybindingContextName = any
export type KeybindingBlock = any
export type ParsedKeystroke = any
export type ParsedBinding = any
export type Chord = any
`,

  'components/mcp/types.ts': `
export type ServerInfo = any
export type StdioServerInfo = any
export type SSEServerInfo = any
export type HTTPServerInfo = any
export type ClaudeAIServerInfo = any
export type AgentMcpServerInfo = any
export type MCPViewState = any
`,

  'components/Spinner/types.ts': `
export type SpinnerMode = 'dots' | 'arc' | 'line' | 'pulse' | 'none'
`,

  'components/FeedbackSurvey/utils.ts': `
export type FeedbackSurveyResponse = any
export type FeedbackSurveyType = any
`,

  'cli/transports/Transport.ts': `
export type Transport = any
`,

  'query/transitions.ts': `
export type Continue = any
export type Terminal = any
`,

  'ink/events/paste-event.ts': `
export type PasteEvent = any
`,

  'ink/events/resize-event.ts': `
export type ResizeEvent = any
`,

  'ink/cursor.ts': `
export type Cursor = any
`,

  'components/ui/option.ts': `
export type Option = any
`,
}

let created = 0
for (const [relPath, content] of Object.entries(stubs)) {
  const absPath = join(SRC, relPath)
  const header = `// Stub: this file was not captured in the sourcemap leak. All exports are typed as any.\n`
  writeFileSync(absPath, header + content.trimStart(), 'utf8')
  console.log(`  updated: src/${relPath}`)
  created++
}

console.log(`\nUpdated ${created} stub files.`)
