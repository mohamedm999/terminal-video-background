import { describe, it, expect } from 'vitest';
import { CURRENT_SCHEMA_VERSION } from '../src/types';

function createMockContext(storedVersion: number = 0) {
  const store = new Map<string, unknown>();
  store.set('tvb:schemaVersion', storedVersion);
  return {
    globalState: {
      get: <T>(key: string, defaultValue: T): T => {
        return (store.get(key) as T) ?? defaultValue;
      },
      update: async (key: string, value: unknown) => {
        store.set(key, value);
      },
    },
    _store: store,
  };
}

describe('MigrationService', () => {
  it('skips migrations when version is current', async () => {
    const { MigrationService } = await import('../src/services/migrationService');
    const service = new (MigrationService as any)();
    const ctx = createMockContext(CURRENT_SCHEMA_VERSION);
    (service as any).registerMigrations();
    await (service as any).runMigrations(ctx);
    const version = ctx.globalState.get('tvb:schemaVersion', 0);
    expect(version).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('runs migrations when version is behind', async () => {
    const { MigrationService } = await import('../src/services/migrationService');
    const service = new (MigrationService as any)();
    const ctx = createMockContext(0);
    (service as any).registerMigrations();
    await (service as any).runMigrations(ctx);
    const version = ctx.globalState.get('tvb:schemaVersion', 0);
    expect(version).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('stores updated version after successful migration', async () => {
    const { MigrationService } = await import('../src/services/migrationService');
    const service = new (MigrationService as any)();
    const ctx = createMockContext(0);
    (service as any).registerMigrations();
    await (service as any).runMigrations(ctx);
    const version = ctx.globalState.get<number>('tvb:schemaVersion', 0);
    expect(version).toBeGreaterThanOrEqual(1);
  });

  it('handles fresh install (no stored version)', async () => {
    const { MigrationService } = await import('../src/services/migrationService');
    const service = new (MigrationService as any)();
    const store = new Map<string, unknown>();
    const ctx = {
      globalState: {
        get: <T>(key: string, defaultValue: T): T => {
          return (store.get(key) as T) ?? defaultValue;
        },
        update: async (key: string, value: unknown) => {
          store.set(key, value);
        },
      },
    };
    (service as any).registerMigrations();
    await (service as any).runMigrations(ctx);
    const version = ctx.globalState.get<number>('tvb:schemaVersion', 0);
    expect(version).toBe(CURRENT_SCHEMA_VERSION);
  });
});
