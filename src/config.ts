import * as vscode from 'vscode';
import { EXTENSION_ID, DEFAULT_CLIENT_ID } from './constants';

export type DetectionStrategy = 'manual' | 'auto' | 'both';
export type HumanModePresence = 'none' | 'simple' | 'detailed';

export interface TimeBasedMessages {
  [timeRange: string]: string[];
}

export interface ExtensionConfig {
  enabled: boolean;
  clientId: string;
  detectionStrategy: DetectionStrategy;
  messages: string[];
  messageRotationInterval: number;
  timeBasedMessages: TimeBasedMessages;
  agentTimeout: number;
  showStatusBar: boolean;
  humanModePresence: HumanModePresence;
  agentName: string;
  showElapsedTime: boolean;
}

export function getConfig(): ExtensionConfig {
  const cfg = vscode.workspace.getConfiguration(EXTENSION_ID);

  return {
    enabled: cfg.get<boolean>('enabled', true),
    clientId: cfg.get<string>('clientId', '') || DEFAULT_CLIENT_ID,
    detectionStrategy: cfg.get<DetectionStrategy>('detectionStrategy', 'both'),
    messages: cfg.get<string[]>('messages', []),
    messageRotationInterval: cfg.get<number>('messageRotationInterval', 300),
    timeBasedMessages: cfg.get<TimeBasedMessages>('timeBasedMessages', {}),
    agentTimeout: cfg.get<number>('agentTimeout', 120),
    showStatusBar: cfg.get<boolean>('showStatusBar', true),
    humanModePresence: cfg.get<HumanModePresence>('humanModePresence', 'none'),
    agentName: cfg.get<string>('agentName', 'AI Agent'),
    showElapsedTime: cfg.get<boolean>('showElapsedTime', true),
  };
}
