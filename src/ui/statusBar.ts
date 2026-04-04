import * as vscode from 'vscode';
import { COMMAND_TOGGLE } from '../constants';

export class StatusBarManager implements vscode.Disposable {
  private readonly statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      -100 // low priority — sits to the right
    );
    this.statusBarItem.command = COMMAND_TOGGLE;
    this.setHumanMode();
  }

  show(): void {
    this.statusBarItem.show();
  }

  hide(): void {
    this.statusBarItem.hide();
  }

  setAgentMode(message?: string): void {
    this.statusBarItem.text = '$(hubot) AI Agent Active';
    this.statusBarItem.tooltip = message
      ? `AI Agent Mode — ${message}\n\nClick to switch to Human Mode`
      : 'AI Agent Mode active\n\nClick to switch to Human Mode';
    this.statusBarItem.backgroundColor = new vscode.ThemeColor(
      'statusBarItem.warningBackground'
    );
  }

  setHumanMode(): void {
    this.statusBarItem.text = '$(person) Human Mode';
    this.statusBarItem.tooltip = 'Human Mode\n\nClick to switch to AI Agent Mode';
    this.statusBarItem.backgroundColor = undefined;
  }

  setConnecting(): void {
    this.statusBarItem.text = '$(sync~spin) Connecting...';
    this.statusBarItem.tooltip = 'Connecting to presence service...';
    this.statusBarItem.backgroundColor = undefined;
  }

  setDisconnected(): void {
    this.statusBarItem.text = '$(debug-disconnect) Disconnected';
    this.statusBarItem.tooltip = 'Not connected to presence service\n\nClick to toggle agent mode anyway';
    this.statusBarItem.backgroundColor = undefined;
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
