import * as vscode from 'vscode';
import { FileOperator } from './fileOperator';
import { VersionDetector } from './versionDetector';
import { PatchStatus } from '../types';

export class RestoreService {
  private fileOperator: FileOperator;
  private versionDetector: VersionDetector;

  constructor(fileOperator: FileOperator, versionDetector: VersionDetector) {
    this.fileOperator = fileOperator;
    this.versionDetector = versionDetector;
  }

  async restoreToClean(): Promise<boolean> {
    const hasPatch = this.fileOperator.hasPatch();

    if (hasPatch) {
      const choice = await vscode.window.showWarningMessage(
        'Remove terminal video background patch and restore VS Code to original state?',
        'Restore',
        'Cancel'
      );

      if (choice !== 'Restore') {
        return false;
      }
    }

    const success = this.fileOperator.restoreFromBackup();

    if (success) {
      vscode.window.showInformationMessage(
        'Restored. Please restart VS Code.',
        'Restart Now'
      ).then(choice => {
        if (choice === 'Restart Now') {
          vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
      });
    } else {
      vscode.window.showErrorMessage('Failed to restore. You may need to reinstall VS Code.');
    }

    return success;
  }

  async getDiagnostics(): Promise<string> {
    const patchStatus = this.fileOperator.getPatchStatus();
    const vsVersion = this.versionDetector.getVSCodeVersion();
    const workbenchExists = this.fileOperator.workbenchExists();
    const backupExists = this.fileOperator.hasBackup();

    const statusNames: Record<number, string> = {
      [PatchStatus.NotPatched]: 'Not Patched',
      [PatchStatus.PatchedByOldVersion]: 'Patched (Old)',
      [PatchStatus.PatchedByCurrentVersion]: 'Patched (Current)',
    };

    return [
      `VS Code: ${vsVersion}`,
      `Workbench: ${workbenchExists ? 'Found' : 'Missing'}`,
      `Patch: ${statusNames[patchStatus] || 'Unknown'}`,
      `Backup: ${backupExists ? 'Available' : 'None'}`,
    ].join('\n');
  }

  async showDiagnostics(): Promise<void> {
    const diag = await this.getDiagnostics();

    const choice = await vscode.window.showInformationMessage(
      `Diagnostics:\n${diag}`,
      'Copy',
      'OK'
    );

    if (choice === 'Copy') {
      await vscode.env.clipboard.writeText(diag);
    }
  }
}
