import { describe, it, expect } from 'vitest';
import { PatchGenerator } from '../src/patcher/patchGenerator';
import { DEFAULT_SETTINGS, PATCH_MARKER_START, PATCH_MARKER_END } from '../src/types';
import type { TerminalVideoSettings } from '../src/types';

describe('PatchGenerator', () => {
  const generator = new PatchGenerator('1.0.0');

  const baseSettings: TerminalVideoSettings = {
    ...DEFAULT_SETTINGS,
    video: '/test/video.mp4',
  };

  it('generates a valid IIFE', () => {
    const patch = generator.generatePatch({
      settings: baseSettings,
      videoPath: '/test/video.mp4',
    });
    expect(patch.trim()).toMatch(/^\(function/);
    expect(patch).toContain('tvbInit()');
  });

  it('includes video URL with vscode-file protocol', () => {
    const patch = generator.generatePatch({
      settings: baseSettings,
      videoPath: '/Users/test/video.mp4',
    });
    expect(patch).toContain('vscode-file://vscode-app/Users/test/video.mp4');
  });

  it('includes opacity setting', () => {
    const settings = { ...baseSettings, opacity: 0.5 };
    const patch = generator.generatePatch({ settings, videoPath: '/v.mp4' });
    expect(patch).toContain('"op":0.5');
  });

  it('includes blur setting', () => {
    const settings = { ...baseSettings, blur: 5 };
    const patch = generator.generatePatch({ settings, videoPath: '/v.mp4' });
    expect(patch).toContain('"bl":5');
  });

  it('includes brightness setting', () => {
    const settings = { ...baseSettings, brightness: 80 };
    const patch = generator.generatePatch({ settings, videoPath: '/v.mp4' });
    expect(patch).toContain('"br":80');
  });

  it('includes saturation setting', () => {
    const settings = { ...baseSettings, saturation: 120 };
    const patch = generator.generatePatch({ settings, videoPath: '/v.mp4' });
    expect(patch).toContain('"sa":120');
  });

  it('includes objectFit setting', () => {
    const settings = { ...baseSettings, objectFit: 'contain' };
    const patch = generator.generatePatch({ settings, videoPath: '/v.mp4' });
    expect(patch).toContain('"fit":"contain"');
  });

  it('includes muted setting', () => {
    const settings = { ...baseSettings, muted: false };
    const patch = generator.generatePatch({ settings, videoPath: '/v.mp4' });
    expect(patch).toContain('"mu":false');
  });

  it('includes loop setting', () => {
    const settings = { ...baseSettings, loop: false };
    const patch = generator.generatePatch({ settings, videoPath: '/v.mp4' });
    expect(patch).toContain('"lo":false');
  });

  it('includes playbackRate setting', () => {
    const settings = { ...baseSettings, playbackRate: 2 };
    const patch = generator.generatePatch({ settings, videoPath: '/v.mp4' });
    expect(patch).toContain('"pr":2');
  });

  it('contains MutationObserver for late DOM', () => {
    const patch = generator.generatePatch({
      settings: baseSettings,
      videoPath: '/v.mp4',
    });
    expect(patch).toContain('MutationObserver');
    expect(patch).toContain('childList');
  });

  it('contains video element creation', () => {
    const patch = generator.generatePatch({
      settings: baseSettings,
      videoPath: '/v.mp4',
    });
    expect(patch).toContain('createElement("video")');
    expect(patch).toContain('autoplay');
    expect(patch).toContain('playsInline');
  });

  it('contains CSS injection', () => {
    const patch = generator.generatePatch({
      settings: baseSettings,
      videoPath: '/v.mp4',
    });
    expect(patch).toContain('createElement("style")');
    expect(patch).toContain('pointer-events:none');
  });

  it('generates cleanup script', () => {
    const cleanup = generator.generateCleanupScript();
    expect(cleanup).toContain('tvb-video-box');
    expect(cleanup).toContain('tvb-style');
    expect(cleanup).toContain('remove');
  });

  it('handles Windows paths', () => {
    const patch = generator.generatePatch({
      settings: baseSettings,
      videoPath: 'C:\\Users\\test\\video.mp4',
    });
    expect(patch).toContain('vscode-file://vscode-app');
    expect(patch).toContain('video.mp4');
  });

  it('handles spaces in paths', () => {
    const patch = generator.generatePatch({
      settings: baseSettings,
      videoPath: '/path with spaces/video.mp4',
    });
    expect(patch).toContain('path%20with%20spaces/video.mp4');
  });

  it('includes __tvb_changeVideo function', () => {
    const patch = generator.generatePatch({
      settings: baseSettings,
      videoPath: '/v.mp4',
    });
    expect(patch).toContain('__tvb_changeVideo');
  });

  it('uses opacity transition for src swap instead of hard swap', () => {
    const patch = generator.generatePatch({
      settings: baseSettings,
      videoPath: '/v.mp4',
    });
    expect(patch).toContain('setTimeout');
    expect(patch).toContain('transition');
  });
});

describe('Default Settings', () => {
  it('has valid default values', () => {
    expect(DEFAULT_SETTINGS.enabled).toBe(false);
    expect(DEFAULT_SETTINGS.opacity).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_SETTINGS.opacity).toBeLessThanOrEqual(1);
    expect(DEFAULT_SETTINGS.blur).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_SETTINGS.brightness).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_SETTINGS.saturation).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_SETTINGS.muted).toBe(true);
    expect(DEFAULT_SETTINGS.loop).toBe(true);
    expect(DEFAULT_SETTINGS.playbackRate).toBe(1);
  });

  it('has correct objectFit default', () => {
    expect(['cover', 'contain', 'fill', 'none']).toContain(DEFAULT_SETTINGS.objectFit);
  });
});

describe('Patch Markers', () => {
  it('markers are valid JS comment format', () => {
    expect(PATCH_MARKER_START).toMatch(/^\/\//);
    expect(PATCH_MARKER_END).toMatch(/^\/\//);
  });

  it('markers are different', () => {
    expect(PATCH_MARKER_START).not.toBe(PATCH_MARKER_END);
  });
});

describe('Patch Strip Logic', () => {
  function stripPatch(content: string): string {
    const escapedStart = PATCH_MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedEnd = PATCH_MARKER_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\n?${escapedStart}[\\s\\S]*?${escapedEnd}`, 'g');
    return content.replace(regex, '');
  }

  it('removes patch markers and content', () => {
    const original = 'var a = 1;\n';
    const patched = original + PATCH_MARKER_START + '\nvar injected = true;\n' + PATCH_MARKER_END + '\n';
    const cleaned = stripPatch(patched);
    expect(cleaned).toContain('var a = 1;');
    expect(cleaned).not.toContain('injected');
    expect(cleaned).not.toContain('tvb-start');
    expect(cleaned).not.toContain('tvb-end');
  });

  it('preserves original content', () => {
    const original = 'function hello() { return "world"; }';
    const patched = original + '\n' + PATCH_MARKER_START + '\n// patch\n' + PATCH_MARKER_END;
    const cleaned = stripPatch(patched);
    expect(cleaned).toContain('function hello()');
    expect(cleaned).not.toContain('patch');
  });

  it('handles content without markers', () => {
    const content = 'var x = 1;';
    const cleaned = stripPatch(content);
    expect(cleaned).toBe(content);
  });

  it('handles multiple patches', () => {
    const content = 'start' + PATCH_MARKER_START + 'patch1' + PATCH_MARKER_END + 'middle' + PATCH_MARKER_START + 'patch2' + PATCH_MARKER_END + 'end';
    const cleaned = stripPatch(content);
    expect(cleaned).toBe('startmiddleend');
  });
});
