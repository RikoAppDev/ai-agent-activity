// Default Discord Application Client ID
// Users should create their own at https://discord.com/developers/applications
// and set it in agentActivity.clientId
export const DEFAULT_CLIENT_ID = '1489708921714118696'; // placeholder — replace with real app ID

// Activity update throttle (Discord rate-limits to every 15s)
export const ACTIVITY_UPDATE_INTERVAL_MS = 15_000;

// Reconnection settings
export const RECONNECT_INTERVAL_MS = 15_000;
export const MAX_RECONNECT_ATTEMPTS = 10;

// Default agent timeout (seconds)
export const DEFAULT_AGENT_TIMEOUT_S = 120;

// Default message rotation interval (seconds)
export const DEFAULT_ROTATION_INTERVAL_S = 300;

// Extension identifiers
export const EXTENSION_ID = 'agentActivity';
export const COMMAND_TOGGLE = `${EXTENSION_ID}.toggleAgentMode`;
export const COMMAND_NEXT_MESSAGE = `${EXTENSION_ID}.nextMessage`;
export const COMMAND_RECONNECT = `${EXTENSION_ID}.reconnect`;
export const COMMAND_OPEN_SETTINGS = `${EXTENSION_ID}.openSettings`;

// Discord image keys (uploaded to Discord Developer Portal)
export const IMAGE_AGENT_ACTIVE = 'agent_active';
export const IMAGE_HUMAN_CODING = 'vscode_icon';
export const IMAGE_SMALL_AI = 'ai_sparkle';
export const IMAGE_SMALL_HUMAN = 'human_icon';
