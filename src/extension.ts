import * as vscode from 'vscode';
import { Logger } from './services/logger';
import { MigrationService } from './services/migrationService';
import { ConfigurationManager } from './services/configManager';
import { Patcher } from './patcher/patcher';
import { CommandRegistrar } from './commands/commandRegistrar';
import { VersionDetector } from './patcher/versionDetector';
import { FileOperator } from './patcher/fileOperator';
import { UpdateDetector } from './patcher/updateDetector';
import { VideoService } from './services/videoService';
import { RestoreService } from './patcher/restoreService';

let patcher: Patcher;

export function activate(context: vscode.ExtensionContext) {
  Logger.initialize();
  Logger.info('Extension activating...');

  MigrationService.getInstance().initialize(context);

  ConfigurationManager.getInstance().initialize(context);

  patcher = new Patcher();
  patcher.setExtensionPath(context.extensionPath);

  const versionDetector = new VersionDetector();
  const fileOperator = new FileOperator();
  const restoreService = new RestoreService(fileOperator, versionDetector);

  const commandRegistrar = new CommandRegistrar(patcher, restoreService);
  commandRegistrar.register(context);

  VideoService.getInstance().initialize(context);

  const updateDetector = new UpdateDetector(versionDetector, fileOperator);
  updateDetector.initialize(context);

  Logger.info('Extension activated');
}

export function deactivate() {
  Logger.info('Extension deactivating...');
  Logger.dispose();
}
