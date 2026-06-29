/**
 * Debug: Login / Auth flow
 *
 * Breakpoint entry points to explore:
 *   - getAuthConfig()         → reads API key / OAuth token from config
 *   - getSubscriptionType()   → determines tier (free/pro/max/ant)
 *   - refreshOAuthToken()     → OAuth token refresh logic
 *   - shouldUseClaudeAIAuth() → decides between API key vs OAuth
 *
 * Set breakpoints in:
 *   src/utils/auth.ts
 *   src/services/oauth/client.ts
 *   src/utils/config.ts
 */

// Config / auth state
import { getGlobalConfig, enableConfigs, checkHasTrustDialogAccepted } from '../src/utils/config.js'

// OAuth
import { shouldUseClaudeAIAuth } from '../src/services/oauth/client.js'

// Secure storage (keychain on macOS)
import { getSecureStorage } from '../src/utils/secureStorage/index.js'

console.log('=== Auth / Login Debug ===\n')

// Unlock config reading (normally done at CLI startup)
enableConfigs()

// 1. Read global config
const config = getGlobalConfig()
console.log('Global config keys:', Object.keys(config))
console.log('Has API key:', !!config.primaryApiKey)
console.log('OAuth tokens present:', !!config.oauthAccount)

// 2. Trust dialog state
const trusted = checkHasTrustDialogAccepted()
console.log('Trust dialog accepted:', trusted)

// 3. OAuth vs API key decision
const useOAuth = shouldUseClaudeAIAuth(undefined)
console.log('Using OAuth (Claude.ai):', useOAuth)

// 4. Secure storage
const storage = getSecureStorage()
console.log('Secure storage type:', storage.constructor.name)

console.log('\nSet breakpoints above, then step through each call to trace auth flow.')
