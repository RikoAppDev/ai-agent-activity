import * as vscode from 'vscode';
import { getConfig, DetectionStrategy } from '../config';
import { ManualToggleStrategy } from './strategies/manualToggle';
import { ChatApiStrategy } from './strategies/chatApiStrategy';
import { EditHeuristicStrategy } from './strategies/editHeuristic';

/**
 * Unified agent detector that combines multiple strategies.
 * Emits a single onAgentStateChanged event consumed by the rest of the extension.
 */
export class AgentDetector implements vscode.Disposable {
  private readonly manual = new ManualToggleStrategy();
  private readonly chatApi = new ChatApiStrategy();
  private readonly editHeuristic = new EditHeuristicStrategy();
  private disposables: vscode.Disposable[] = [];

  private _isAgentActive = false;

  private readonly _onAgentStateChanged = new vscode.EventEmitter<boolean>();
  public readonly onAgentStateChanged = this._onAgentStateChanged.event;

  get isAgentActive(): boolean {
    return this._isAgentActive;
  }

  initialize(): void {
    const config = getConfig();
    const strategy = config.detectionStrategy;

    // Manual toggle is always available (even in "auto" mode, as a fallback command)
    this.disposables.push(
      this.manual.onStateChanged(() => this.evaluate())
    );

    // Auto strategies
    if (strategy === 'auto' || strategy === 'both') {
      this.chatApi.initialize();
      this.editHeuristic.initialize();

      this.disposables.push(
        this.chatApi.onStateChanged(() => this.evaluate()),
        this.editHeuristic.onStateChanged(() => this.evaluate())
      );
    }
  }

  /**
   * Toggle manual agent mode (from status bar click or command).
   */
  toggleManual(): void {
    this.manual.toggle();
  }

  /**
   * Programmatically signal agent activity (e.g., from a chat API event).
   */
  signalActivity(): void {
    this.chatApi.signalAgentActivity();
  }

  private evaluate(): void {
    const config = getConfig();
    const strategy = config.detectionStrategy;

    let active = false;

    switch (strategy) {
      case 'manual':
        active = this.manual.isAgentActive;
        break;
      case 'auto':
        active = this.chatApi.isAgentActive || this.editHeuristic.isAgentActive;
        break;
      case 'both':
        active = this.manual.isAgentActive ||
                 this.chatApi.isAgentActive ||
                 this.editHeuristic.isAgentActive;
        break;
    }

    if (active !== this._isAgentActive) {
      this._isAgentActive = active;
      this._onAgentStateChanged.fire(active);
    }
  }

  dispose(): void {
    this.manual.dispose();
    this.chatApi.dispose();
    this.editHeuristic.dispose();
    for (const d of this.disposables) {
      d.dispose();
    }
    this._onAgentStateChanged.dispose();
  }
}
