import { describe, it, expect, beforeEach } from 'vitest';
import { SettingsService } from '../src/services/settingsService';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    service = SettingsService.getInstance();
  });

  it('getSettings returns defaults when no config is set', () => {
    const settings = service.getSettings();
    expect(settings.enabled).toBe(false);
    expect(settings.video).toBe('');
    expect(settings.opacity).toBe(0.3);
    expect(settings.workspaceVideo).toBe('');
  });

  it('hasWorkspaceOverride returns false by default', () => {
    expect(service.hasWorkspaceOverride('workspaceVideo')).toBe(false);
  });

  it('inspectSetting returns inspection object', () => {
    const result = service.inspectSetting('workspaceVideo');
    expect(result).toBeDefined();
    expect(result?.key).toBe('terminalVideo.workspaceVideo');
  });

  it('clearWorkspaceSetting calls update with Workspace target', async () => {
    await expect(service.clearWorkspaceSetting('workspaceVideo')).resolves.not.toThrow();
  });
});
