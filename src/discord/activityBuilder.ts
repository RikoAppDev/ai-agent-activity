import * as vscode from 'vscode';
import { getConfig } from '../config';
import {
  IMAGE_AGENT_ACTIVE,
  IMAGE_HUMAN_CODING,
  IMAGE_SMALL_AI,
  IMAGE_SMALL_HUMAN,
} from '../constants';
import type { ActivityPayload } from './rpcManager';

export class ActivityBuilder {
  private agentStartTimestamp: number | null = null;
  private humanStartTimestamp: number | null = null;

  setAgentStart(timestamp?: number): void {
    this.agentStartTimestamp = timestamp ?? Date.now();
  }

  setHumanStart(timestamp?: number): void {
    this.humanStartTimestamp = timestamp ?? Date.now();
  }

  buildAgentActivity(message: string): ActivityPayload {
    const config = getConfig();

    const payload: ActivityPayload = {
      details: message,
      state: this.getWorkspaceText(),
      largeImageKey: IMAGE_AGENT_ACTIVE,
      largeImageText: `${config.agentName} is coding`,
      smallImageKey: IMAGE_SMALL_AI,
      smallImageText: 'Agent Mode',
    };

    if (config.showElapsedTime && this.agentStartTimestamp) {
      payload.startTimestamp = this.agentStartTimestamp;
    }

    return payload;
  }

  buildHumanActivity(): ActivityPayload | null {
    const config = getConfig();

    if (config.humanModePresence === 'none') {
      return null;
    }

    const editor = vscode.window.activeTextEditor;

    if (config.humanModePresence === 'simple') {
      const payload: ActivityPayload = {
        details: 'Coding in VS Code',
        largeImageKey: IMAGE_HUMAN_CODING,
        largeImageText: 'Visual Studio Code',
        smallImageKey: IMAGE_SMALL_HUMAN,
        smallImageText: 'Human Mode',
      };

      if (config.showElapsedTime && this.humanStartTimestamp) {
        payload.startTimestamp = this.humanStartTimestamp;
      }

      return payload;
    }

    // Detailed mode
    const fileName = editor?.document.fileName.split(/[/\\]/).pop() ?? 'No file';
    const languageId = editor?.document.languageId ?? 'unknown';

    const payload: ActivityPayload = {
      details: `Editing ${fileName}`,
      state: this.getWorkspaceText(),
      largeImageKey: languageId,
      largeImageText: languageId.charAt(0).toUpperCase() + languageId.slice(1),
      smallImageKey: IMAGE_SMALL_HUMAN,
      smallImageText: 'Human Mode',
    };

    if (config.showElapsedTime && this.humanStartTimestamp) {
      payload.startTimestamp = this.humanStartTimestamp;
    }

    return payload;
  }

  private getWorkspaceText(): string {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders?.length) {
      return 'No workspace';
    }
    return `In ${folders[0].name}`;
  }
}
