import * as vscode from 'vscode';
import { getConfig } from '../../config';

/**
 * Experimental: detects rapid text edits that might indicate an AI agent is modifying files.
 * This is a heuristic approach — not 100% accurate.
 *
 * Strategy: if many edits happen across multiple lines in a short period with no apparent
 * keyboard input, it's likely an agent. Single-character sequential edits = human typing.
 */
export class EditHeuristicStrategy implements vscode.Disposable {
  private _isAgentActive = false;
  private editTimestamps: number[] = [];
  private largeEditCount = 0;
  private windowMs = 3000; // 3-second sliding window
  private threshold = 8; // edits in window to consider "agent-like"
  private timeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private disposables: vscode.Disposable[] = [];

  private readonly _onStateChanged = new vscode.EventEmitter<boolean>();
  public readonly onStateChanged = this._onStateChanged.event;

  get isAgentActive(): boolean {
    return this._isAgentActive;
  }

  initialize(): void {
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        this.onTextChange(e);
      })
    );
  }

  private onTextChange(e: vscode.TextDocumentChangeEvent): void {
    // Ignore output channels, settings, etc.
    if (e.document.uri.scheme !== 'file') { return; }

    const now = Date.now();

    // Count multi-line or large edits (agent-like behavior)
    for (const change of e.contentChanges) {
      const lines = change.text.split('\n').length - 1;
      const chars = change.text.length;

      // Large edits (multi-line inserts, bulk replacements) = agent signal
      if (lines > 2 || chars > 100) {
        this.largeEditCount++;
      }
    }

    this.editTimestamps.push(now);

    // Clean old timestamps outside the window
    const cutoff = now - this.windowMs;
    this.editTimestamps = this.editTimestamps.filter((t) => t > cutoff);

    // Check if edit pattern looks agent-like
    if (this.editTimestamps.length >= this.threshold || this.largeEditCount >= 3) {
      this.signalAgentActivity();
      this.largeEditCount = 0;
      this.editTimestamps = [];
    }
  }

  private signalAgentActivity(): void {
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
