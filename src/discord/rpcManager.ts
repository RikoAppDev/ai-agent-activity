import { Client } from '@xhayper/discord-rpc';
import * as vscode from 'vscode';
import {
  RECONNECT_INTERVAL_MS,
  MAX_RECONNECT_ATTEMPTS,
  ACTIVITY_UPDATE_INTERVAL_MS,
} from '../constants';
import { getConfig } from '../config';

export interface ActivityPayload {
  details?: string;
  state?: string;
  largeImageKey?: string;
  largeImageText?: string;
  smallImageKey?: string;
  smallImageText?: string;
  startTimestamp?: number;
  buttons?: Array<{ label: string; url: string }>;
}

export class DiscordRPCManager implements vscode.Disposable {
  private client: Client | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private lastActivity: ActivityPayload | null = null;
  private lastUpdateTime = 0;
  private updateTimer: ReturnType<typeof setTimeout> | null = null;
  private _isConnected = false;
  private disposed = false;

  private readonly _onConnectionChanged = new vscode.EventEmitter<boolean>();
  public readonly onConnectionChanged = this._onConnectionChanged.event;

  get isConnected(): boolean {
    return this._isConnected;
  }

  async connect(): Promise<void> {
    if (this.disposed) { return; }
    await this.disconnect();

    const config = getConfig();
    const clientId = config.clientId;

    try {
      this.client = new Client({ clientId });

      this.client.on('ready', () => {
        this._isConnected = true;
        this.reconnectAttempts = 0;
        this._onConnectionChanged.fire(true);
        console.log('[Agent Activity] Connected to Discord RPC');

        // Re-send last activity if we had one
        if (this.lastActivity) {
          this.setActivityImmediate(this.lastActivity);
        }
      });

      this.client.on('disconnected', () => {
        this._isConnected = false;
        this._onConnectionChanged.fire(false);
        console.log('[Agent Activity] Disconnected from Discord RPC');
        this.scheduleReconnect();
      });

      await this.client.login();
    } catch (err) {
      console.warn('[Agent Activity] Failed to connect to Discord:', err);
      this._isConnected = false;
      this._onConnectionChanged.fire(false);
      this.scheduleReconnect();
    }
  }

  async disconnect(): Promise<void> {
    this.clearReconnectTimer();
    this.clearUpdateTimer();

    if (this.client) {
      try {
        await this.client.user?.clearActivity();
        await this.client.destroy();
      } catch {
        // Ignore errors during cleanup
      }
      this.client = null;
    }

    if (this._isConnected) {
      this._isConnected = false;
      this._onConnectionChanged.fire(false);
    }
  }

  async setActivity(payload: ActivityPayload): Promise<void> {
    this.lastActivity = payload;

    // Throttle updates to respect Discord rate limits
    const now = Date.now();
    const elapsed = now - this.lastUpdateTime;

    if (elapsed >= ACTIVITY_UPDATE_INTERVAL_MS) {
      await this.setActivityImmediate(payload);
    } else {
      // Schedule a deferred update
      this.clearUpdateTimer();
      this.updateTimer = setTimeout(async () => {
        if (this.lastActivity) {
          await this.setActivityImmediate(this.lastActivity);
        }
      }, ACTIVITY_UPDATE_INTERVAL_MS - elapsed);
    }
  }

  async clearActivity(): Promise<void> {
    this.lastActivity = null;
    this.clearUpdateTimer();

    if (!this._isConnected || !this.client?.user) { return; }

    try {
      await this.client.user.clearActivity();
    } catch (err) {
      console.warn('[Agent Activity] Failed to clear activity:', err);
    }
  }

  private async setActivityImmediate(payload: ActivityPayload): Promise<void> {
    if (!this._isConnected || !this.client?.user) { return; }

    try {
      await this.client.user.setActivity({
        details: payload.details,
        state: payload.state,
        largeImageKey: payload.largeImageKey,
        largeImageText: payload.largeImageText,
        smallImageKey: payload.smallImageKey,
        smallImageText: payload.smallImageText,
        startTimestamp: payload.startTimestamp ? new Date(payload.startTimestamp) : undefined,
        buttons: payload.buttons,
      });
      this.lastUpdateTime = Date.now();
    } catch (err) {
      console.warn('[Agent Activity] Failed to set activity:', err);
    }
  }

  private scheduleReconnect(): void {
    if (this.disposed) { return; }

    this.clearReconnectTimer();

    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[Agent Activity] Max reconnect attempts reached. Use "Reconnect to Discord" command.');
      return;
    }

    this.reconnectAttempts++;
    const delay = RECONNECT_INTERVAL_MS * Math.min(this.reconnectAttempts, 4);

    this.reconnectTimer = setTimeout(async () => {
      if (!this.disposed) {
        await this.connect();
      }
    }, delay);
  }

  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearUpdateTimer(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
  }

  dispose(): void {
    this.disposed = true;
    this.disconnect();
    this._onConnectionChanged.dispose();
  }
}
