import * as vscode from 'vscode';
import { TerminalVideoSettings, DEFAULT_SETTINGS } from '../types';
import { SettingsService } from './settingsService';
import { Logger } from './logger';

export class ConfigurationManager {
  private static instance: ConfigurationManager | null = null;
  private settingsService: SettingsService;

  private constructor() {
    this.settingsService = SettingsService.getInstance();
  }

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  initialize(context: vscode.ExtensionContext): void {
    this.clampInvalidValues();
    this.setupListener(context);
    Logger.info('ConfigurationManager initialized');
  }

  private clampInvalidValues(): void {
    const s = this.settingsService.getSettings();
    if (s.opacity < 0 || s.opacity > 1) this.settingsService.updateSetting('opacity', DEFAULT_SETTINGS.opacity);
    if (s.brightness < 0 || s.brightness > 200) this.settingsService.updateSetting('brightness', DEFAULT_SETTINGS.brightness);
    if (s.saturation < 0 || s.saturation > 200) this.settingsService.updateSetting('saturation', DEFAULT_SETTINGS.saturation);
    if (s.playbackRate < 0.25 || s.playbackRate > 4) this.settingsService.updateSetting('playbackRate', DEFAULT_SETTINGS.playbackRate);
  }

  private setupListener(context: vscode.ExtensionContext): void {
    const disposable = this.settingsService.onDidChangeConfiguration(async (e) => {
      if (this.settingsService.hasChanged(e, 'enabled')) {
        const s = this.settingsService.getSettings();
        const hasSource = s.video || s.workspaceVideo || (s.randomMode && s.randomFolder);
        if (s.enabled && hasSource) {
          await vscode.commands.executeCommand('terminalVideo.reloadBackground');
        } else if (!s.enabled) {
          await vscode.commands.executeCommand('terminalVideo.disable');
        }
      }

      if (
        this.settingsService.hasChanged(e, 'video') ||
        this.settingsService.hasChanged(e, 'opacity') ||
        this.settingsService.hasChanged(e, 'blur') ||
        this.settingsService.hasChanged(e, 'brightness') ||
        this.settingsService.hasChanged(e, 'saturation') ||
        this.settingsService.hasChanged(e, 'randomMode') ||
        this.settingsService.hasChanged(e, 'randomFolder')
      ) {
        const s = this.settingsService.getSettings();
        const hasSource = s.video || s.workspaceVideo || (s.randomMode && s.randomFolder);
        if (s.enabled && hasSource) {
          await vscode.commands.executeCommand('terminalVideo.reloadBackground');
        }
      }
    });

    context.subscriptions.push(disposable);

    const folderDisposable = vscode.workspace.onDidChangeWorkspaceFolders(async () => {
      Logger.info('Workspace folders changed, re-evaluating video source');
      const s = this.settingsService.getSettings();
      const hasSource = s.video || s.workspaceVideo || (s.randomMode && s.randomFolder);
      if (s.enabled && hasSource) {
        await vscode.commands.executeCommand('terminalVideo.reloadBackground');
      }
    });
    context.subscriptions.push(folderDisposable);
  }

  async resetToDefaults(): Promise<void> {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await this.settingsService.updateSetting(key as keyof TerminalVideoSettings, value);
    }
    Logger.info('Settings reset to defaults');
  }
}
