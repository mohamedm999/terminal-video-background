import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('ConfigManager watches random settings', () => {
  it('configManager.ts includes randomMode in hasChanged checks', () => {
    const filePath = path.resolve(__dirname, '../src/services/configManager.ts');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain("hasChanged(e, 'randomMode')");
    expect(content).toContain("hasChanged(e, 'randomFolder')");
  });

  it('configManager enabled handler checks randomMode/randomFolder', () => {
    const filePath = path.resolve(__dirname, '../src/services/configManager.ts');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('randomMode && s.randomFolder');
  });
});
