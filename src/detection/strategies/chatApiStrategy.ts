import * as vscode from 'vscode';
import { getConfig } from '../../config';

/**
 * Attempts to detect agent activity via VS Code's Chat/LanguageModel APIs.
 * Falls back gracefully if APIs are not available (older VS Code versions).
 */
export class ChatApiStrategy implements vscode.Disposable {
  private _isAgentActive = false;
  private timeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private disposables: vscode.Disposable[] = [];

  private readonly _onStateChanged = new vscode.EventEmitter<boolean>();
  public readonly onStateChanged = this._onStateChanged.event;

  get isAgentActive(): boolean {
    return this._isAgentActive;
  }

  initialize(): void {
    // Try to hook into chat participant events if available
    try {
      this.registerChatListeners();
    } catch {
      console.log('[Agent Activity] Chat API not available — auto-detection limited.');
    }

    // Listen for language model requests as a secondary signal
    try {
      this.registerLanguageModelListeners();
    } catch {
      console.log('[Agent Activity] Language Model API not available.');
    }
  }

  private registerChatListeners(): void {
    // vscode.chat namespace may not be available in all versions
    const chat = (vscode as any).chat;
    if (!chat) { return; }

    // onDidPerformUserAction — fires when user interacts with chat responses
    if (typeof chat.onDidPerformUserAction === 'function') {
      this.disposables.push(
        chat.onDidPerformUserAction((action: any) => {
          if (action?.action?.kind === 'apply' || action?.action?.kind === 'insert') {
            this.signalAgentActivity();
          }
        })
      );
    }
  }

  private registerLanguageModelListeners(): void {
    // vscode.lm namespace for language model access
    const lm = (vscode as any).lm;
    if (!lm) { return; }

    // onDidChangeChatModels — fires when available chat models change
    if (typeof lm.onDidChangeChatModels === 'function') {
      this.disposables.push(
        lm.onDidChangeChatModels(() => {
          // Model availability change can indicate Copilot activity
          this.signalAgentActivity();
        })
      );
    }
  }

  signalAgentActivity(): void {
    const wasActive = this._isAgentActive;
    this._isAgentActive = true;

    if (!wasActive) {
      this._onStateChanged.fire(true);
    }

    this.resetTimeout();
  }

  private resetTimeout(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }

    const config = getConfig();
    this.timeoutTimer = setTimeout(() => {
      this._isAgentActive = false;
      this._onStateChanged.fire(false);
    }, config.agentTimeout * 1000);
  }

  dispose(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }
    for (const d of this.disposables) {
      d.dispose();
    }
    this._onStateChanged.dispose();
  }
}
