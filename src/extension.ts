import * as vscode from 'vscode';
import { getConfig } from './config';
import {
  EXTENSION_ID,
  COMMAND_TOGGLE,
  COMMAND_NEXT_MESSAGE,
  COMMAND_RECONNECT,
  COMMAND_OPEN_SETTINGS,
} from './constants';
import { DiscordRPCManager } from './discord/rpcManager';
import { ActivityBuilder } from './discord/activityBuilder';
import { AgentDetector } from './detection/agentDetector';
import { MessageRotator } from './messages/messageRotator';
import { StatusBarManager } from './ui/statusBar';

let rpcManager: DiscordRPCManager;
let activityBuilder: ActivityBuilder;
let agentDetector: AgentDetector;
let messageRotator: MessageRotator;
let statusBar: StatusBarManager;
let disposables: vscode.Disposable[] = [];

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const config = getConfig();
  if (!config.enabled) {
    return;
  }

  // Initialize components
  rpcManager = new DiscordRPCManager();
  activityBuilder = new ActivityBuilder();
  agentDetector = new AgentDetector();
  messageRotator = new MessageRotator();
  statusBar = new StatusBarManager();

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND_TOGGLE, () => {
      agentDetector.toggleManual();
    }),

    vscode.commands.registerCommand(COMMAND_NEXT_MESSAGE, () => {
      if (agentDetector.isAgentActive) {
        messageRotator.rotateNow();
      }
    }),

    vscode.commands.registerCommand(COMMAND_RECONNECT, async () => {
      rpcManager.resetReconnectAttempts();
      statusBar.setConnecting();
      await rpcManager.connect();
    }),

    vscode.commands.registerCommand(COMMAND_OPEN_SETTINGS, () => {
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        `@ext:${EXTENSION_ID}`
      );
    })
  );

  // Wire up events
  disposables.push(
    // Agent state changes → update Discord presence
    agentDetector.onAgentStateChanged(async (isAgent) => {
      if (isAgent) {
        activityBuilder.setAgentStart();
        messageRotator.start();
        const message = messageRotator.getCurrentMessage();
        statusBar.setAgentMode(message);
        await rpcManager.setActivity(activityBuilder.buildAgentActivity(message));
      } else {
        messageRotator.stop();
        activityBuilder.setHumanStart();
        statusBar.setHumanMode();

        const humanActivity = activityBuilder.buildHumanActivity();
        if (humanActivity) {
          await rpcManager.setActivity(humanActivity);
        } else {
          await rpcManager.clearActivity();
        }
      }
    }),

    // Message rotation → update Discord presence
    messageRotator.onMessageChanged(async (message) => {
      if (agentDetector.isAgentActive) {
        statusBar.setAgentMode(message);
        await rpcManager.setActivity(activityBuilder.buildAgentActivity(message));
      }
    }),

    // Discord connection state → update status bar
    rpcManager.onConnectionChanged((connected) => {
      if (connected) {
        if (agentDetector.isAgentActive) {
          statusBar.setAgentMode(messageRotator.getCurrentMessage());
        } else {
          statusBar.setHumanMode();
        }
      } else {
        statusBar.setDisconnected();
      }
    }),

    // Config changes → reinitialize as needed
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(EXTENSION_ID)) {
        onConfigChanged();
      }
    })
  );

  // Initialize detection
  agentDetector.initialize();

  // Show status bar
  if (config.showStatusBar) {
    statusBar.show();
  }

  // Set initial human mode timestamp
  activityBuilder.setHumanStart();

  // Connect to Discord
  statusBar.setConnecting();
  await rpcManager.connect();

  // If connected and human mode has presence, show it
  if (rpcManager.isConnected && !agentDetector.isAgentActive) {
    const humanActivity = activityBuilder.buildHumanActivity();
    if (humanActivity) {
      await rpcManager.setActivity(humanActivity);
    }
  }

  // Register all for cleanup
  context.subscriptions.push(
    rpcManager,
    agentDetector,
    messageRotator,
    statusBar,
    ...disposables
  );

  console.log('[Agent Activity] Extension activated');
}

function onConfigChanged(): void {
  const config = getConfig();

  if (!config.enabled) {
    rpcManager.clearActivity();
    statusBar.hide();
    return;
  }

  if (config.showStatusBar) {
    statusBar.show();
  } else {
    statusBar.hide();
  }
}

export function deactivate(): void {
  // Cleanup handled by context.subscriptions
  console.log('[Agent Activity] Extension deactivated');
}
