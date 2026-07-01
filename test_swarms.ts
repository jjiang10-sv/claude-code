import { isAgentSwarmsEnabled } from '/Users/john/Documents/projects/blueRaven/agents/claude-code-src/src/utils/agentSwarmsEnabled.ts';
import { getAllBaseTools } from '/Users/john/Documents/projects/blueRaven/agents/claude-code-src/src/tools.ts';

console.log("isAgentSwarmsEnabled():", isAgentSwarmsEnabled());
try {
  const tools = getAllBaseTools();
  console.log("Internal tools list count:", tools.length);
  console.log("Available tools:", tools.map(t => t.name));
} catch (e) {
  console.error("Error getting internal tools:", e);
}
