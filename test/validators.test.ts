import { describe, it, expect } from 'vitest';
import {
  clampOpacity,
  clampPercentage,
  clampPlaybackRate,
  clampBlur,
} from '../src/utils/validators';
import { DEFAULT_SETTINGS, PatchStatus, SUPPORTED_VIDEO_EXTENSIONS } from '../src/types';

describe('Validators - clamp functions', () => {
  describe('clampOpacity', () => {
    it('clamps negative to 0', () => expect(clampOpacity(-1)).toBe(0));
    it('clamps above 1 to 1', () => expect(clampOpacity(2)).toBe(1));
    it('passes 0', () => expect(clampOpacity(0)).toBe(0));
    it('passes 1', () => expect(clampOpacity(1)).toBe(1));
    it('passes 0.5', () => expect(clampOpacity(0.5)).toBe(0.5));
    it('passes 0.3', () => expect(clampOpacity(0.3)).toBe(0.3));
  });

  describe('clampPercentage', () => {
    it('clamps negative to 0', () => expect(clampPercentage(-50)).toBe(0));
    it('clamps above 200 to 200', () => expect(clampPercentage(300)).toBe(200));
    it('passes 0', () => expect(clampPercentage(0)).toBe(0));
    it('passes 100', () => expect(clampPercentage(100)).toBe(100));
    it('passes 200', () => expect(clampPercentage(200)).toBe(200));
  });

  describe('clampPlaybackRate', () => {
    it('clamps below 0.25', () => expect(clampPlaybackRate(0.1)).toBe(0.25));
    it('clamps above 4', () => expect(clampPlaybackRate(5)).toBe(4));
    it('passes 0.25', () => expect(clampPlaybackRate(0.25)).toBe(0.25));
    it('passes 1', () => expect(clampPlaybackRate(1)).toBe(1));
    it('passes 2', () => expect(clampPlaybackRate(2)).toBe(2));
    it('passes 4', () => expect(clampPlaybackRate(4)).toBe(4));
  });

  describe('clampBlur', () => {
    it('clamps negative to 0', () => expect(clampBlur(-5)).toBe(0));
    it('clamps above 20 to 20', () => expect(clampBlur(25)).toBe(20));
    it('passes 0', () => expect(clampBlur(0)).toBe(0));
    it('passes 10', () => expect(clampBlur(10)).toBe(10));
    it('passes 20', () => expect(clampBlur(20)).toBe(20));
  });
});

describe('Default Settings', () => {
  it('has all required keys', () => {
    const requiredKeys = [
      'enabled', 'video', 'opacity', 'blur', 'brightness', 'saturation',
      'objectFit', 'loop', 'muted', 'workspaceVideo', 'autoRestore',
      'randomMode', 'randomFolder', 'randomRecursive', 'playbackRate',
    ];

    for (const key of requiredKeys) {
      expect(DEFAULT_SETTINGS).toHaveProperty(key);
    }
  });

  it('has sensible defaults', () => {
    expect(DEFAULT_SETTINGS.enabled).toBe(false);
    expect(DEFAULT_SETTINGS.opacity).toBe(0.3);
    expect(DEFAULT_SETTINGS.blur).toBe(0);
    expect(DEFAULT_SETTINGS.brightness).toBe(100);
    expect(DEFAULT_SETTINGS.saturation).toBe(100);
    expect(DEFAULT_SETTINGS.objectFit).toBe('cover');
    expect(DEFAULT_SETTINGS.loop).toBe(true);
    expect(DEFAULT_SETTINGS.muted).toBe(true);
    expect(DEFAULT_SETTINGS.playbackRate).toBe(1);
    expect(DEFAULT_SETTINGS.autoRestore).toBe(true);
  });
});

describe('PatchStatus enum', () => {
  it('has correct numeric values', () => {
    expect(PatchStatus.NotPatched).toBe(0);
    expect(PatchStatus.PatchedByOldVersion).toBe(1);
    expect(PatchStatus.PatchedByCurrentVersion).toBe(2);
  });
});

describe('Supported video extensions', () => {
  it('includes mp4', () => {
    expect(SUPPORTED_VIDEO_EXTENSIONS).toContain('.mp4');
  });

  it('includes webm', () => {
    expect(SUPPORTED_VIDEO_EXTENSIONS).toContain('.webm');
  });

  it('includes gif', () => {
    expect(SUPPORTED_VIDEO_EXTENSIONS).toContain('.gif');
  });
});
