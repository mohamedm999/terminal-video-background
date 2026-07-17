import * as vscode from 'vscode';
import { TerminalVideoSettings, DEFAULT_SETTINGS } from '../types';
import { Logger } from './logger';

export class SettingsService {
  private static instance: SettingsService | null = null;

  private constructor() {}

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  getSettings(): TerminalVideoSettings {
    const cfg = vscode.workspace.getConfiguration('terminalVideo');
    return {
      enabled: cfg.get<boolean>('enabled', DEFAULT_SETTINGS.enabled),
      video: cfg.get<string>('video', DEFAULT_SETTINGS.video),
      opacity: cfg.get<number>('opacity', DEFAULT_SETTINGS.opacity),
      blur: cfg.get<number>('blur', DEFAULT_SETTINGS.blur),
      brightness: cfg.get<number>('brightness', DEFAULT_SETTINGS.brightness),
      saturation: cfg.get<number>('saturation', DEFAULT_SETTINGS.saturation),
      objectFit: cfg.get<TerminalVideoSettings['objectFit']>('objectFit', DEFAULT_SETTINGS.objectFit),
      loop: cfg.get<boolean>('loop', DEFAULT_SETTINGS.loop),
      muted: cfg.get<boolean>('muted', DEFAULT_SETTINGS.muted),
      workspaceVideo: cfg.get<string>('workspaceVideo', DEFAULT_SETTINGS.workspaceVideo),
      autoRestore: cfg.get<boolean>('autoRestore', DEFAULT_SETTINGS.autoRestore),
      randomMode: cfg.get<boolean>('randomMode', DEFAULT_SETTINGS.randomMode),
      randomFolder: cfg.get<string>('randomFolder', DEFAULT_SETTINGS.randomFolder),
      randomRecursive: cfg.get<boolean>('randomRecursive', DEFAULT_SETTINGS.randomRecursive),
      playbackRate: cfg.get<number>('playbackRate', DEFAULT_SETTINGS.playbackRate),
    };
  }

  async updateSetting<K extends keyof TerminalVideoSettings>(
    key: K,
    value: TerminalVideoSettings[K],
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
  ): Promise<void> {
    const cfg = vscode.workspace.getConfiguration('terminalVideo');
    await cfg.update(key, value, target);
    Logger.debug(`Setting updated: ${key}`);
  }

  async setEnabled(v: boolean): Promise<void> {
    await this.updateSetting('enabled', v);
  }

  async setVideo(v: string): Promise<void> {
    await this.updateSetting('video', v);
  }

  async setOpacity(v: number): Promise<void> {
    await this.updateSetting('opacity', Math.max(0, Math.min(1, v)));
  }

  async setRandomMode(v: boolean): Promise<void> {
    await this.updateSetting('randomMode', v);
  }

  async setRandomFolder(v: string): Promise<void> {
    await this.updateSetting('randomFolder', v);
  }

  onDidChangeConfiguration(callback: (e: vscode.ConfigurationChangeEvent) => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('terminalVideo')) {
        callback(e);
      }
    });
  }

  hasChanged(e: vscode.ConfigurationChangeEvent, key: keyof TerminalVideoSettings): boolean {
    return e.affectsConfiguration(`terminalVideo.${key}`);
  }

  inspectSetting<K extends keyof TerminalVideoSettings>(key: K) {
    const cfg = vscode.workspace.getConfiguration('terminalVideo');
    return cfg.inspect(key);
  }

  hasWorkspaceOverride(key: keyof TerminalVideoSettings): boolean {
    const i = this.inspectSetting(key);
    return i !== undefined && i.workspaceValue !== undefined;
  }

  async clearWorkspaceSetting(key: keyof TerminalVideoSettings): Promise<void> {
    const cfg = vscode.workspace.getConfiguration('terminalVideo');
    await cfg.update(key, undefined, vscode.ConfigurationTarget.Workspace);
    Logger.debug(`Workspace setting cleared: ${key}`);
  }
}
