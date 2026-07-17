import * as path from 'path';
import { TerminalVideoSettings, PatchResult } from '../types';
import { PatchGenerator } from './patchGenerator';
import { FileOperator } from './fileOperator';
import { VersionDetector } from './versionDetector';
import { SettingsService } from '../services/settingsService';
import { Logger } from '../services/logger';
import { validateVideoPath, getVideoFiles } from '../utils/validators';
import { RandomVideoTracker } from '../utils/randomVideoTracker';

const EXTENSION_VERSION = '1.0.0';

export class Patcher {
  private patchGenerator: PatchGenerator;
  private fileOperator: FileOperator;
  private versionDetector: VersionDetector;
  private settingsService: SettingsService;
  private tracker: RandomVideoTracker | null = null;
  private extensionPath: string = '';

  constructor() {
    this.patchGenerator = new PatchGenerator(EXTENSION_VERSION);
    this.fileOperator = new FileOperator();
    this.versionDetector = new VersionDetector();
    this.settingsService = SettingsService.getInstance();
  }

  setExtensionPath(extPath: string): void {
    this.extensionPath = extPath;
  }

  async applyPatch(): Promise<PatchResult> {
    Logger.info('Applying patch...');

    if (!this.fileOperator.workbenchExists()) {
      return { success: false, message: 'VS Code workbench file not found' };
    }

    const settings = this.settingsService.getSettings();

    if (!settings.enabled) {
      return { success: false, message: 'Extension is disabled' };
    }

    const videoPath = this.resolveVideo(settings);
    if (!videoPath) {
      return { success: false, message: 'No valid video path configured' };
    }

    const validation = validateVideoPath(videoPath);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const resolvedPath = validation.resolvedPath!;
    const vsVersion = this.versionDetector.getVSCodeVersion();

    const patchCode = this.patchGenerator.generatePatch({ settings, videoPath: resolvedPath });
    const success = this.fileOperator.applyPatch(patchCode, vsVersion);

    if (success) {
      return {
        success: true,
        message: 'Patch applied. Please restart VS Code.',
        requiresRestart: true,
      };
    }

    return { success: false, message: 'Failed to write patch. Check permissions.' };
  }

  async removePatch(): Promise<PatchResult> {
    Logger.info('Removing patch...');

    const success = this.fileOperator.removePatch();

    if (success) {
      return {
        success: true,
        message: 'Patch removed. Please restart VS Code.',
        requiresRestart: true,
      };
    }

    return { success: false, message: 'Failed to remove patch.' };
  }

  async restoreOriginal(): Promise<PatchResult> {
    Logger.info('Restoring original file...');

    const success = this.fileOperator.restoreFromBackup();

    if (success) {
      return {
        success: true,
        message: 'Original restored. Please restart VS Code.',
        requiresRestart: true,
      };
    }

    return { success: false, message: 'No backup found or restore failed.' };
  }

  isPatched(): boolean {
    return this.fileOperator.hasPatch();
  }

  getPatchStatus(): number {
    return this.fileOperator.getPatchStatus();
  }

  private resolveVideo(settings: TerminalVideoSettings): string | null {
    if (settings.randomMode && settings.randomFolder) {
      const files = getVideoFiles(settings.randomFolder, settings.randomRecursive);
      if (files.length === 0) return null;

      if (!this.tracker || this.tracker.total === 0) {
        this.tracker = new RandomVideoTracker(files);
      } else {
        this.tracker.updatePool(files);
      }

      return this.tracker.next();
    }

    if (settings.workspaceVideo) {
      const v = validateVideoPath(settings.workspaceVideo);
      if (v.valid && v.resolvedPath) return v.resolvedPath;
    }

    if (settings.video) {
      const v = validateVideoPath(settings.video);
      if (v.valid && v.resolvedPath) return v.resolvedPath;
    }

    // Fall back to bundled default video
    if (this.extensionPath) {
      const defaultVideo = path.join(this.extensionPath, 'media', 'default.mp4');
      const v = validateVideoPath(defaultVideo);
      if (v.valid && v.resolvedPath) {
        Logger.info(`Using bundled default video: ${v.resolvedPath}`);
        return v.resolvedPath;
      }
    }

    return null;
  }
}
