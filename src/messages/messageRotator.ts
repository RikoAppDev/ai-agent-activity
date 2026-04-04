import * as vscode from 'vscode';
import { getConfig } from '../config';
import {
  DEFAULT_AGENT_MESSAGES,
  NIGHT_MESSAGES,
  MORNING_MESSAGES,
  AFTERNOON_MESSAGES,
} from './defaultMessages';

export class MessageRotator implements vscode.Disposable {
  private rotationTimer: ReturnType<typeof setInterval> | null = null;
  private currentIndex = -1;
  private usedIndices = new Set<number>();
  private currentMessage = '';

  private readonly _onMessageChanged = new vscode.EventEmitter<string>();
  public readonly onMessageChanged = this._onMessageChanged.event;

  start(): void {
    this.stop();
    this.rotateNow();

    const config = getConfig();
    const intervalMs = Math.max(config.messageRotationInterval, 30) * 1000;

    this.rotationTimer = setInterval(() => {
      this.rotateNow();
    }, intervalMs);
  }

  stop(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
  }

  getCurrentMessage(): string {
    if (!this.currentMessage) {
      this.rotateNow();
    }
    return this.currentMessage;
  }

  rotateNow(): void {
    const messages = this.getMessagePool();
    if (messages.length === 0) { return; }

    // Reset pool if all messages have been shown
    if (this.usedIndices.size >= messages.length) {
      this.usedIndices.clear();
    }

    // Pick a random unused message
    let index: number;
    do {
      index = Math.floor(Math.random() * messages.length);
    } while (this.usedIndices.has(index) && this.usedIndices.size < messages.length);

    this.usedIndices.add(index);
    this.currentIndex = index;
    this.currentMessage = this.resolveVariables(messages[index]);
    this._onMessageChanged.fire(this.currentMessage);
  }

  private getMessagePool(): string[] {
    const config = getConfig();

    // 1. User-defined messages take priority
    if (config.messages.length > 0) {
      // Check for time-based overrides
      const timeBased = this.getTimeBasedMessages(config.timeBasedMessages);
      if (timeBased.length > 0) {
        return [...config.messages, ...timeBased];
      }
      return config.messages;
    }

    // 2. Default messages + time-of-day messages
    const hour = new Date().getHours();
    let timeMessages: string[] = [];

    if (hour >= 22 || hour < 6) {
      timeMessages = NIGHT_MESSAGES;
    } else if (hour >= 6 && hour < 10) {
      timeMessages = MORNING_MESSAGES;
    } else if (hour >= 12 && hour < 14) {
      timeMessages = AFTERNOON_MESSAGES;
    }

    // Check user time-based overrides even with defaults
    const userTimeBased = this.getTimeBasedMessages(config.timeBasedMessages);
    if (userTimeBased.length > 0) {
      timeMessages = [...timeMessages, ...userTimeBased];
    }

    return [...DEFAULT_AGENT_MESSAGES, ...timeMessages];
  }

  private getTimeBasedMessages(timeBasedConfig: Record<string, string[]>): string[] {
    const currentHour = new Date().getHours();
    const result: string[] = [];

    for (const [range, messages] of Object.entries(timeBasedConfig)) {
      const match = range.match(/^(\d{1,2})-(\d{1,2})$/);
      if (!match) { continue; }

      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);

      let inRange: boolean;
      if (start <= end) {
        // e.g., "08-18" — daytime range
        inRange = currentHour >= start && currentHour < end;
      } else {
        // e.g., "22-06" — overnight range
        inRange = currentHour >= start || currentHour < end;
      }

      if (inRange) {
        result.push(...messages);
      }
    }

    return result;
  }

  private resolveVariables(message: string): string {
    const config = getConfig();
    const now = new Date();
    const editor = vscode.window.activeTextEditor;

    const vars: Record<string, string> = {
      agent: config.agentName,
      workspace: vscode.workspace.workspaceFolders?.[0]?.name ?? 'Unknown',
      file: editor?.document.fileName.split(/[/\\]/).pop() ?? 'no file',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    return message.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
  }

  dispose(): void {
    this.stop();
    this._onMessageChanged.dispose();
  }
}
