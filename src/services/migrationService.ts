import * as vscode from 'vscode';
import { CURRENT_SCHEMA_VERSION } from '../types';
import { Logger } from './logger';

type Migration = {
  fromVersion: number;
  toVersion: number;
  migrate: () => Promise<void>;
};

export class MigrationService {
  private static instance: MigrationService | null = null;
  private migrations: Migration[] = [];

  private constructor() {}

  static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  initialize(context: vscode.ExtensionContext): void {
    this.registerMigrations();
    this.runMigrations(context);
  }

  private registerMigrations(): void {
    this.migrations.push({
      fromVersion: 0,
      toVersion: 1,
      migrate: async () => {
        Logger.info('Migration v0 -> v1: no structural changes needed');
      },
    });
  }

  private async runMigrations(context: vscode.ExtensionContext): Promise<void> {
    const storedVersion = context.globalState.get<number>('tvb:schemaVersion', 0);

    if (storedVersion >= CURRENT_SCHEMA_VERSION) {
      Logger.debug(`Schema version ${storedVersion} is current, no migrations needed`);
      return;
    }

    const applicable = this.migrations
      .filter(m => m.fromVersion >= storedVersion && m.toVersion <= CURRENT_SCHEMA_VERSION)
      .sort((a, b) => a.toVersion - b.toVersion);

    if (applicable.length === 0) {
      await context.globalState.update('tvb:schemaVersion', CURRENT_SCHEMA_VERSION);
      return;
    }

    for (const migration of applicable) {
      Logger.info(`Running migration v${migration.fromVersion} -> v${migration.toVersion}`);
      try {
        await migration.migrate();
        await context.globalState.update('tvb:schemaVersion', migration.toVersion);
      } catch (error) {
        Logger.error(`Migration v${migration.fromVersion} -> v${migration.toVersion} failed`, error);
        break;
      }
    }
  }
}
