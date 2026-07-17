import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve(__dirname, '../src');

function getSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getSourceFiles(fullPath));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('Settings Write Consistency', () => {
  it('UpdateDetector does not import vscode.workspace.getConfiguration directly', () => {
    const detectorPath = path.join(SRC_DIR, 'patcher/updateDetector.ts');
    const content = fs.readFileSync(detectorPath, 'utf-8');
    expect(content).not.toContain("vscode.workspace.getConfiguration('terminalVideo')");
    expect(content).toContain('SettingsService');
  });

  it('CommandRegistrar does not use direct config.update for enabled', () => {
    const regPath = path.join(SRC_DIR, 'commands/commandRegistrar.ts');
    const content = fs.readFileSync(regPath, 'utf-8');
    const lines = content.split('\n');
    const directWrites = lines.filter(
      line => line.includes('config.update(') && line.includes('enabled')
    );
    expect(directWrites).toHaveLength(0);
  });

  it('all command files import SettingsService', () => {
    const regPath = path.join(SRC_DIR, 'commands/commandRegistrar.ts');
    const content = fs.readFileSync(regPath, 'utf-8');
    expect(content).toContain("import { SettingsService }");
  });

  it('no source files use ConfigurationTarget.Global in direct config calls', () => {
    const files = getSourceFiles(SRC_DIR);
    const violations: string[] = [];
    for (const file of files) {
      if (file.includes('settingsService.ts')) continue;
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (
          line.includes('.update(') &&
          line.includes('ConfigurationTarget.Global') &&
          !line.includes('//') &&
          !line.includes('SettingsService')
        ) {
          violations.push(`${path.basename(file)}:${i + 1}: ${line.trim()}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
