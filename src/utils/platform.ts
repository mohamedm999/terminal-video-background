import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { Logger } from '../services/logger';

export type Platform = 'windows' | 'macos' | 'linux';

export function getPlatform(): Platform {
  switch (process.platform) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'macos';
    default:
      return 'linux';
  }
}

export function isAdmin(): boolean {
  if (process.platform === 'win32') {
    try {
      execSync('net session', { stdio: 'pipe', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
  return process.getuid?.() === 0;
}

export function writeFileAtomic(filePath: string, content: string): boolean {
  const dir = path.dirname(filePath);
  const tempPath = path.join(dir, `.tvb-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`);

  try {
    fs.writeFileSync(tempPath, content, 'utf-8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (error) {
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch {
      // ignore cleanup errors
    }
    return false;
  }
}

export function writeFileWithAdmin(filePath: string, content: string): boolean {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'EACCES' || nodeError.code === 'EPERM') {
      Logger.warn(`Permission denied for ${filePath}, requesting admin elevation...`);
      return requestElevatedWrite(filePath, content);
    }
    Logger.error(`Failed to write file: ${filePath}`, error);
    return false;
  }
}

function requestElevatedWrite(filePath: string, content: string): boolean {
  const tempPath = path.join(os.tmpdir(), `tvb-${Date.now()}.tmp`);

  try {
    fs.writeFileSync(tempPath, content, 'utf-8');
  } catch (error) {
    Logger.error('Failed to write temp file', error);
    return false;
  }

  try {
    if (process.platform === 'win32') {
      const psScript = [
        'Start-Process',
        '-FilePath "cmd"',
        '-ArgumentList "/c move /Y \\"' + tempPath + '\\" \\"' + filePath + '\\""',
        '-Verb RunAs',
        '-Wait',
      ].join(' ');
      execSync(`powershell -Command "${psScript}"`, { stdio: 'pipe', timeout: 30000 });
    } else if (process.platform === 'darwin') {
      // macOS: use osascript for admin elevation
      const escapedTemp = tempPath.replace(/"/g, '\\"');
      const escapedFile = filePath.replace(/"/g, '\\"');
      execSync(
        `osascript -e 'do shell script "cp -f \\"${escapedTemp}\\" \\"${escapedFile}\\"" with administrator privileges'`,
        { stdio: 'pipe', timeout: 30000 },
      );
    } else {
      // Linux: try pkexec first, then fallback to sudo with terminal
      try {
        execSync(`pkexec cp -f "${tempPath}" "${filePath}"`, { stdio: 'pipe', timeout: 30000 });
      } catch {
        // pkexec not available, try sudo via xterm/gnome-terminal
        execSync(`sudo cp -f "${tempPath}" "${filePath}"`, { stdio: 'pipe', timeout: 30000 });
      }
    }

    Logger.info('File written with elevated privileges');
    return true;
  } catch (error) {
    Logger.error('Failed to write with admin privileges', error);
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch {
      // ignore
    }
    return false;
  }
}

export function readFileContent(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    Logger.error(`Failed to read file: ${filePath}`, error);
    return null;
  }
}

export function backupFile(filePath: string): string | null {
  const backupPath = `${filePath}.tvb-backup`;
  try {
    fs.copyFileSync(filePath, backupPath);
    Logger.debug(`Backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    Logger.error(`Failed to backup file: ${filePath}`, error);
    return null;
  }
}

export function restoreBackup(filePath: string): boolean {
  const backupPath = `${filePath}.tvb-backup`;
  try {
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      fs.unlinkSync(backupPath);
      Logger.debug('Backup restored');
      return true;
    }
    return false;
  } catch (error) {
    Logger.error(`Failed to restore backup: ${filePath}`, error);
    return false;
  }
}
