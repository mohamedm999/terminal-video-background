import * as fs from 'fs';
import { getVSCodePaths } from '../utils/paths';
import { Logger } from '../services/logger';

export class VersionDetector {
  private paths = getVSCodePaths();

  getVSCodeVersion(): string {
    const candidates = [
      `${this.paths.appRoot}/resources/app/package.json`,
      `${this.paths.appRoot}/package.json`,
    ];

    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) {
          const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
          if (data.version) {
            Logger.debug(`VS Code version: ${data.version}`);
            return data.version;
          }
        }
      } catch (error) {
        Logger.debug(`Failed to read ${p}`, error);
      }
    }

    return '0.0.0';
  }

  getWorkbenchModTime(): string {
    try {
      if (fs.existsSync(this.paths.workbenchHtmlPath)) {
        const stat = fs.statSync(this.paths.workbenchHtmlPath);
        return stat.mtimeMs.toString();
      }
    } catch {
      // ignore
    }
    return '0';
  }
}
