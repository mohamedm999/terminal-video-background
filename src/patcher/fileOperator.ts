import * as fs from 'fs';
import { PatchStatus } from '../types';
import { getVSCodePaths } from '../utils/paths';
import { writeFileWithAdmin, backupFile } from '../utils/platform';
import { Logger } from '../services/logger';

const HTML_SCRIPT_OPEN = '<!-- tvb-inject-start -->';
const HTML_SCRIPT_CLOSE = '<!-- tvb-inject-end -->';

export class FileOperator {
  private paths = getVSCodePaths();

  getWorkbenchPath(): string {
    return this.paths.workbenchHtmlPath;
  }

  workbenchExists(): boolean {
    try {
      return fs.existsSync(this.paths.workbenchHtmlPath);
    } catch {
      return false;
    }
  }

  hasPatch(): boolean {
    const content = this.readWorkbench();
    if (!content) return false;
    return content.includes(HTML_SCRIPT_OPEN) && content.includes(HTML_SCRIPT_CLOSE);
  }

  getPatchStatus(): PatchStatus {
    const content = this.readWorkbench();
    if (!content) return PatchStatus.NotPatched;

    const hasAnyPatch = content.includes(HTML_SCRIPT_OPEN);

    if (hasAnyPatch) {
      return PatchStatus.PatchedByCurrentVersion;
    }

    return PatchStatus.NotPatched;
  }

  getInstalledPatchVersion(): string | null {
    const content = this.readWorkbench();
    if (!content) return null;

    const regex = new RegExp(`${escapeRegex(HTML_SCRIPT_OPEN)}[\\s\\S]*?tvb-ver-(\\d+\\.\\d+\\.\\d+)`);
    const match = content.match(regex);
    return match ? match[1] : null;
  }

  applyPatch(scriptCode: string, version: string): boolean {
    Logger.info(`Applying patch to: ${this.paths.workbenchHtmlPath}`);

    if (!this.workbenchExists()) {
      Logger.error('Workbench HTML file not found');
      return false;
    }

    const backup = backupFile(this.paths.workbenchHtmlPath);
    if (!backup) {
      Logger.error('Failed to create backup, aborting');
      return false;
    }
    Logger.info(`Backup created: ${backup}`);

    const content = this.readWorkbench();
    if (!content) {
      Logger.error('Failed to read workbench HTML file');
      return false;
    }

    const cleanedContent = this.stripExistingPatch(content);

    const scriptBlock = [
      '',
      HTML_SCRIPT_OPEN,
      `<script data-tvb-ver="${version}">`,
      scriptCode.trim(),
      '</script>',
      HTML_SCRIPT_CLOSE,
      '',
    ].join('\n');

    let newContent = cleanedContent;

    const cspSingleLine = /(script-src\s+'self'\s+'unsafe-eval'\s+blob:)/;
    if (cspSingleLine.test(newContent) && !newContent.includes("'unsafe-inline'")) {
      newContent = newContent.replace(cspSingleLine, "$1 'unsafe-inline'");
    }

    const cspMultiLine = /(script-src[\s\n]+('self')[\s\n]+('unsafe-eval')[\s\n]+(blob:)[\s\n]*;)/;
    if (cspMultiLine.test(newContent) && !newContent.includes("'unsafe-inline'")) {
      newContent = newContent.replace(cspMultiLine, "script-src\n\t\t\t\t\t'self'\n\t\t\t\t\t'unsafe-eval'\n\t\t\t\t\tblob:\n\t\t\t\t\t'unsafe-inline'\n\t\t\t\t;");
    }

    const trustedTypesPattern = /require-trusted-types-for\s+'script'\s*;/;
    if (trustedTypesPattern.test(newContent)) {
      newContent = newContent.replace(trustedTypesPattern, '');
      Logger.info('Removed require-trusted-types-for directive');
    }

    const mediaSrcSingleLine = /(media-src\s+'self')/;
    if (mediaSrcSingleLine.test(newContent) && !newContent.includes('vscode-file:')) {
      newContent = newContent.replace(mediaSrcSingleLine, "$1 vscode-file:");
    }

    const mediaSrcMultiLine = /(media-src[\s\n]+('self')[\s\n]*;)/;
    if (mediaSrcMultiLine.test(newContent) && !newContent.includes('vscode-file:')) {
      newContent = newContent.replace(mediaSrcMultiLine, "media-src\n\t\t\t\t\t'self'\n\t\t\t\t\tvscode-file:\n\t\t\t\t;");
    }

    const insertBefore = '</body>';
    const bodyCloseIndex = newContent.lastIndexOf(insertBefore);

    if (bodyCloseIndex >= 0) {
      newContent = newContent.slice(0, bodyCloseIndex) + scriptBlock + '\n' + newContent.slice(bodyCloseIndex);
    } else {
      newContent = newContent + scriptBlock;
    }

    const success = writeFileWithAdmin(this.paths.workbenchHtmlPath, newContent);

    if (success) {
      Logger.info('Patch applied successfully to workbench.html');
    } else {
      Logger.error('Failed to write patched HTML file');
    }

    return success;
  }

  removePatch(): boolean {
    Logger.info('Removing patch from workbench HTML file...');

    const content = this.readWorkbench();
    if (!content) {
      Logger.error('Failed to read workbench HTML file');
      return false;
    }

    if (!this.hasPatch()) {
      Logger.info('No patch found to remove');
      return true;
    }

    const cleaned = this.stripExistingPatch(content);
    const success = writeFileWithAdmin(this.paths.workbenchHtmlPath, cleaned);

    if (success) {
      Logger.info('Patch removed successfully');
    } else {
      Logger.error('Failed to remove patch');
    }

    return success;
  }

  restoreFromBackup(): boolean {
    Logger.info('Restoring from backup...');

    const backupPath = `${this.paths.workbenchHtmlPath}.tvb-backup`;

    if (!fs.existsSync(backupPath)) {
      Logger.warn('No backup file found');
      return false;
    }

    try {
      fs.copyFileSync(backupPath, this.paths.workbenchHtmlPath);
      fs.unlinkSync(backupPath);
      Logger.info('Restored from backup successfully');
      return true;
    } catch (error) {
      Logger.error('Failed to restore from backup', error);
      return false;
    }
  }

  hasBackup(): boolean {
    try {
      return fs.existsSync(`${this.paths.workbenchHtmlPath}.tvb-backup`);
    } catch {
      return false;
    }
  }

  getBackupModTime(): string | null {
    try {
      const backupPath = `${this.paths.workbenchHtmlPath}.tvb-backup`;
      if (fs.existsSync(backupPath)) {
        const stat = fs.statSync(backupPath);
        return stat.mtime.toISOString();
      }
    } catch {
      // ignore
    }
    return null;
  }

  private readWorkbench(): string | null {
    try {
      return fs.readFileSync(this.paths.workbenchHtmlPath, 'utf-8');
    } catch {
      return null;
    }
  }

  private stripExistingPatch(content: string): string {
    const escapedStart = escapeRegex(HTML_SCRIPT_OPEN);
    const escapedEnd = escapeRegex(HTML_SCRIPT_CLOSE);
    const regex = new RegExp(`\\n?${escapedStart}[\\s\\S]*?${escapedEnd}\\n?`, 'g');
    let cleaned = content.replace(regex, '');

    const cspWithInlineSingle = /(script-src\s+'self'\s+'unsafe-eval'\s+blob:\s+'unsafe-inline')/;
    if (cspWithInlineSingle.test(cleaned)) {
      cleaned = cleaned.replace(cspWithInlineSingle, "script-src 'self' 'unsafe-eval' blob:");
    }

    const cspWithInlineMulti = /(script-src[\s\n]+('self')[\s\n]+('unsafe-eval')[\s\n]+(blob:)[\s\n]+('unsafe-inline')[\s\n]*;)/;
    if (cspWithInlineMulti.test(cleaned)) {
      cleaned = cleaned.replace(cspWithInlineMulti, "script-src\n\t\t\t\t\t'self'\n\t\t\t\t\t'unsafe-eval'\n\t\t\t\t\tblob:\n\t\t\t\t;");
    }

    const mediaSrcSingleWithVsb = /(media-src\s+'self'\s+vscode-file:)/;
    if (mediaSrcSingleWithVsb.test(cleaned)) {
      cleaned = cleaned.replace(mediaSrcSingleWithVsb, "media-src 'self'");
    }

    const mediaSrcMultiWithVsb = /(media-src[\s\n]+('self')[\s\n]+vscode-file:[\s\n]*;)/;
    if (mediaSrcMultiWithVsb.test(cleaned)) {
      cleaned = cleaned.replace(mediaSrcMultiWithVsb, "media-src\n\t\t\t\t\t'self'\n\t\t\t\t;");
    }

    return cleaned;
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
