import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve(__dirname, '../src');

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(SRC_DIR, relativePath), 'utf-8');
}

describe('Phase 6: VersionDetector cleanup', () => {
  it('no longer contains isVersionSupported method', () => {
    const content = readSource('patcher/versionDetector.ts');
    expect(content).not.toContain('isVersionSupported');
  });

  it('still exposes getVSCodeVersion', () => {
    const content = readSource('patcher/versionDetector.ts');
    expect(content).toContain('getVSCodeVersion');
  });

  it('still exposes getWorkbenchModTime', () => {
    const content = readSource('patcher/versionDetector.ts');
    expect(content).toContain('getWorkbenchModTime');
  });
});

describe('Phase 6: RestoreService wiring', () => {
  it('extension.ts imports RestoreService', () => {
    const content = readSource('extension.ts');
    expect(content).toContain("import { RestoreService }");
    expect(content).toContain("new RestoreService(fileOperator, versionDetector)");
  });

  it('commandRegistrar accepts RestoreService in constructor', () => {
    const content = readSource('commands/commandRegistrar.ts');
    expect(content).toContain("import { RestoreService }");
    expect(content).toContain('restoreService: RestoreService');
  });

  it('registers showDiagnostics command', () => {
    const content = readSource('commands/commandRegistrar.ts');
    expect(content).toContain('terminalVideo.showDiagnostics');
  });
});

describe('Phase 6: package.json commands', () => {
  const pkg = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '../package.json'), 'utf-8'
  ));

  it('has 12 commands', () => {
    expect(pkg.contributes.commands).toHaveLength(12);
  });

  it('includes showDiagnostics', () => {
    const cmd = pkg.contributes.commands.find(
      (c: any) => c.command === 'terminalVideo.showDiagnostics'
    );
    expect(cmd).toBeDefined();
    expect(cmd.title).toContain('Diagnostics');
  });
});

describe('Phase 6: UpdateDetector globalState timing', () => {
  it('Later choice returns before persisting version (user can re-prompt next launch)', () => {
    const content = readSource('patcher/updateDetector.ts');

    const laterConditionIndex = content.indexOf("choice === 'Later'");
    const persistIndex = content.indexOf("context.globalState.update('tvb:lastVersion'");

    expect(laterConditionIndex).toBeGreaterThan(0);

    const persistAfterLater = content.indexOf("context.globalState.update('tvb:lastVersion'", laterConditionIndex);
    expect(persistAfterLater).toBeGreaterThan(laterConditionIndex);
  });

  it('log message says "version update" or "workbench file modification"', () => {
    const content = readSource('patcher/updateDetector.ts');
    expect(content).toContain("'version update'");
    expect(content).toContain("'workbench file modification'");
  });

  it('does not log "VS Code updated" (the old misleading message)', () => {
    const content = readSource('patcher/updateDetector.ts');
    expect(content).not.toContain("'VS Code updated'");
  });
});

describe('Phase 6: .vscodeignore includes out/', () => {
  const ignore = fs.readFileSync(
    path.resolve(__dirname, '../.vscodeignore'), 'utf-8'
  );

  it('does NOT exclude out/', () => {
    expect(ignore).not.toMatch(/^out\/\*\*/m);
  });

  it('does NOT exclude out/**', () => {
    expect(ignore).not.toContain('out/**');
  });
});
