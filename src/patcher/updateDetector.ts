import * as vscode from 'vscode';
import { VersionDetector } from './versionDetector';
import { FileOperator } from './fileOperator';
import { PatchStatus } from '../types';
import { Logger } from '../services/logger';
import { SettingsService } from '../services/settingsService';

export class UpdateDetector {
  private versionDetector: VersionDetector;
  private fileOperator: FileOperator;
  private settingsService: SettingsService;
  private lastKnownVersion: string = '';
  private lastModTime: string = '';

  constructor(versionDetector: VersionDetector, fileOperator: FileOperator) {
    this.versionDetector = versionDetector;
    this.fileOperator = fileOperator;
    this.settingsService = SettingsService.getInstance();
  }

  initialize(context: vscode.ExtensionContext): void {
    this.lastKnownVersion = context.globalState.get<string>('tvb:lastVersion', '');
    this.lastModTime = context.globalState.get<string>('tvb:lastModTime', '');

    this.checkForUpdates(context);

    Logger.info('UpdateDetector initialized');
  }

  private async checkForUpdates(context: vscode.ExtensionContext): Promise<void> {
    const currentVersion = this.versionDetector.getVSCodeVersion();
    const currentModTime = this.versionDetector.getWorkbenchModTime();

    const isFirstRun = this.lastKnownVersion === '' && this.lastModTime === '';

    if (isFirstRun) {
      await context.globalState.update('tvb:lastVersion', currentVersion);
      await context.globalState.update('tvb:lastModTime', currentModTime);
      this.lastKnownVersion = currentVersion;
      this.lastModTime = currentModTime;
      return;
    }

    const versionChanged = this.lastKnownVersion !== currentVersion;
    const fileChanged = this.lastModTime !== currentModTime;

    if (!versionChanged && !fileChanged) {
      return;
    }

    const changeType = versionChanged ? 'version update' : 'workbench file modification';
    Logger.info(`VS Code ${changeType} detected: ${this.lastKnownVersion} -> ${currentVersion}`);

    const s = this.settingsService.getSettings();
    const autoRestore = s.autoRestore;

    if (!autoRestore || !this.fileOperator.hasPatch()) {
      return;
    }

    const isCurrent = this.fileOperator.getPatchStatus() === PatchStatus.PatchedByCurrentVersion;

    if (isCurrent) {
      return;
    }

    Logger.info('Patch needs reapplication after update');

    const promptMessage = versionChanged
      ? `VS Code updated (${this.lastKnownVersion} -> ${currentVersion}). Terminal Video Background needs to be reapplied.`
      : 'VS Code workbench file was modified. Terminal Video Background needs to be reapplied.';

    const choice = await vscode.window.showInformationMessage(
      promptMessage,
      'Reapply Now',
      'Later',
      'Disable'
    );

    if (choice === 'Later' || choice === undefined) {
      return;
    }

    await context.globalState.update('tvb:lastVersion', currentVersion);
    await context.globalState.update('tvb:lastModTime', currentModTime);
    this.lastKnownVersion = currentVersion;
    this.lastModTime = currentModTime;

    if (choice === 'Reapply Now') {
      await vscode.commands.executeCommand('terminalVideo.reloadBackground');
    } else if (choice === 'Disable') {
      await this.settingsService.setEnabled(false);
    }
  }
}
