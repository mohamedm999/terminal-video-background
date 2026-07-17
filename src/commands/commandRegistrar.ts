import * as vscode from 'vscode';
import { Patcher } from '../patcher/patcher';
import { RestoreService } from '../patcher/restoreService';
import { SettingsService } from '../services/settingsService';
import { Logger } from '../services/logger';
import { folderHasVideos } from '../utils/validators';

export class CommandRegistrar {
  private patcher: Patcher;
  private restoreService: RestoreService;
  private settingsService: SettingsService;

  constructor(patcher: Patcher, restoreService: RestoreService) {
    this.patcher = patcher;
    this.restoreService = restoreService;
    this.settingsService = SettingsService.getInstance();
  }

  register(context: vscode.ExtensionContext): void {
    const cmds: Array<[string, () => Thenable<void>]> = [
      ['terminalVideo.enable', () => this.cmdEnable()],
      ['terminalVideo.disable', () => this.cmdDisable()],
      ['terminalVideo.selectVideo', () => this.cmdSelectVideo()],
      ['terminalVideo.restoreDefault', () => this.cmdRestoreDefault()],
      ['terminalVideo.reloadBackground', () => this.cmdReload()],
      ['terminalVideo.openSettings', () => this.cmdOpenSettings()],
      ['terminalVideo.toggle', () => this.cmdToggle()],
      ['terminalVideo.randomVideo', () => this.cmdRandomVideo()],
      ['terminalVideo.selectWorkspaceVideo', () => this.cmdSelectWorkspaceVideo()],
      ['terminalVideo.clearWorkspaceVideo', () => this.cmdClearWorkspaceVideo()],
      ['terminalVideo.nextRandomVideo', () => this.cmdNextRandomVideo()],
      ['terminalVideo.showDiagnostics', () => this.cmdShowDiagnostics()],
    ];

    for (const [id, handler] of cmds) {
      context.subscriptions.push(vscode.commands.registerCommand(id, handler));
    }

    Logger.info('Commands registered');
  }

  private async cmdEnable(): Promise<void> {
    await this.settingsService.setEnabled(true);
    const result = await this.patcher.applyPatch();
    this.notify(result);
  }

  private async cmdDisable(): Promise<void> {
    await this.settingsService.setEnabled(false);
    const result = await this.patcher.removePatch();
    this.notify(result);
  }

  private async cmdSelectVideo(): Promise<void> {
    const uris = await vscode.window.showOpenDialog({
      canSelectMany: false,
      canSelectFiles: true,
      canSelectFolders: false,
      openLabel: 'Select Video',
      filters: { 'Video Files': ['mp4', 'webm', 'ogg', 'gif'], 'All': ['*'] },
    });

    if (!uris || uris.length === 0) return;

    const videoPath = uris[0].fsPath;
    await this.settingsService.setVideo(videoPath);
    await this.settingsService.setEnabled(true);
    vscode.window.showInformationMessage(`Video set: ${videoPath}`);

    const result = await this.patcher.applyPatch();
    this.notify(result);
  }

  private async cmdRestoreDefault(): Promise<void> {
    const choice = await vscode.window.showWarningMessage(
      'Remove patch and reset all settings?',
      'Restore',
      'Cancel'
    );

    if (choice !== 'Restore') return;

    const result = await this.patcher.restoreOriginal();
    this.notify(result);

    await this.settingsService.setEnabled(false);
  }

  private async cmdReload(): Promise<void> {
    const result = await this.patcher.applyPatch();
    this.notify(result);
  }

  private async cmdOpenSettings(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.openSettings', 'terminalVideo');
  }

  private async cmdToggle(): Promise<void> {
    const settings = this.settingsService.getSettings();
    const enabled = !settings.enabled;

    await this.settingsService.setEnabled(enabled);

    const result = enabled
      ? await this.patcher.applyPatch()
      : await this.patcher.removePatch();
    this.notify(result);
  }

  private async cmdRandomVideo(): Promise<void> {
    const settings = this.settingsService.getSettings();

    if (!settings.randomFolder) {
      const folderUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        canSelectFiles: false,
        canSelectFolders: true,
        openLabel: 'Select Video Folder',
      });

      if (!folderUri || folderUri.length === 0) return;

      const folderPath = folderUri[0].fsPath;
      if (!folderHasVideos(folderPath, settings.randomRecursive)) {
        vscode.window.showWarningMessage('No supported video files found in this folder.');
        return;
      }

      await this.settingsService.setRandomFolder(folderPath);
    }

    await this.settingsService.setRandomMode(true);
    await this.settingsService.setEnabled(true);

    const result = await this.patcher.applyPatch();
    this.notify(result);
  }

  private async cmdSelectWorkspaceVideo(): Promise<void> {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      vscode.window.showWarningMessage('No workspace folder open. Open a folder first.');
      return;
    }

    const uris = await vscode.window.showOpenDialog({
      canSelectMany: false,
      canSelectFiles: true,
      canSelectFolders: false,
      openLabel: 'Select Workspace Video',
      filters: { 'Video Files': ['mp4', 'webm', 'ogg', 'gif'], 'All': ['*'] },
    });

    if (!uris || uris.length === 0) return;

    await this.settingsService.updateSetting('workspaceVideo', uris[0].fsPath, vscode.ConfigurationTarget.Workspace);
    await this.settingsService.setEnabled(true);
    vscode.window.showInformationMessage(`Workspace video set: ${uris[0].fsPath}`);

    const result = await this.patcher.applyPatch();
    this.notify(result);
  }

  private async cmdClearWorkspaceVideo(): Promise<void> {
    const hasOverride = this.settingsService.hasWorkspaceOverride('workspaceVideo');
    if (!hasOverride) {
      vscode.window.showInformationMessage('No workspace video to clear.');
      return;
    }

    await this.settingsService.clearWorkspaceSetting('workspaceVideo');
    vscode.window.showInformationMessage('Workspace video cleared. Using global video.');

    const settings = this.settingsService.getSettings();
    if (settings.enabled && settings.video) {
      const result = await this.patcher.applyPatch();
      this.notify(result);
    }
  }

  private async cmdNextRandomVideo(): Promise<void> {
    const settings = this.settingsService.getSettings();

    if (!settings.randomMode || !settings.randomFolder) {
      vscode.window.showWarningMessage('Random mode is not enabled. Use "Random Video" command first.');
      return;
    }

    const files = folderHasVideos(settings.randomFolder, settings.randomRecursive);
    if (!files) {
      vscode.window.showWarningMessage('No video files found in the random folder.');
      return;
    }

    const result = await this.patcher.applyPatch();
    this.notify(result);
  }

  private async cmdShowDiagnostics(): Promise<void> {
    await this.restoreService.showDiagnostics();
  }

  private notify(result: { success: boolean; message: string; requiresRestart?: boolean }): void {
    if (result.success) {
      const items = result.requiresRestart ? ['Restart Now'] : [];
      vscode.window.showInformationMessage(result.message, ...items).then(choice => {
        if (choice === 'Restart Now') {
          vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
      });
    } else {
      vscode.window.showErrorMessage(result.message);
    }
  }
}
