import * as vscode from 'vscode';

/**
 * Manual toggle strategy — user clicks status bar or runs command.
 * 100% reliable, no guessing.
 */
export class ManualToggleStrategy implements vscode.Disposable {
  private _isAgentActive = false;

  private readonly _onStateChanged = new vscode.EventEmitter<boolean>();
  public readonly onStateChanged = this._onStateChanged.event;

  get isAgentActive(): boolean {
    return this._isAgentActive;
  }

  toggle(): void {
    this._isAgentActive = !this._isAgentActive;
    this._onStateChanged.fire(this._isAgentActive);
  }

  setActive(active: boolean): void {
    if (this._isAgentActive !== active) {
      this._isAgentActive = active;
      this._onStateChanged.fire(this._isAgentActive);
    }
  }

  dispose(): void {
    this._onStateChanged.dispose();
  }
}
