import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { getVideoFilesInFolder, getVideoFilesInFolderRecursive, getVideoFiles, folderHasVideos } from '../src/utils/validators';

describe('getVideoFilesInFolder', () => {
  it('returns empty for nonexistent folder', () => {
    expect(getVideoFilesInFolder('/nonexistent/path')).toEqual([]);
  });

  it('returns only video files from flat folder', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tvb-test-'));
    fs.writeFileSync(path.join(tmpDir, 'test.mp4'), 'fake');
    fs.writeFileSync(path.join(tmpDir, 'test.txt'), 'fake');
    fs.writeFileSync(path.join(tmpDir, 'test.webm'), 'fake');
    const result = getVideoFilesInFolder(tmpDir);
    expect(result.length).toBe(2);
    expect(result.every(f => f.endsWith('.mp4') || f.endsWith('.webm'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('getVideoFilesInFolderRecursive', () => {
  it('finds videos in subdirectories', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tvb-test-'));
    const subDir = path.join(tmpDir, 'sub');
    fs.mkdirSync(subDir);
    fs.writeFileSync(path.join(tmpDir, 'root.mp4'), 'fake');
    fs.writeFileSync(path.join(subDir, 'nested.webm'), 'fake');
    fs.writeFileSync(path.join(tmpDir, 'readme.txt'), 'fake');
    const result = getVideoFilesInFolderRecursive(tmpDir);
    expect(result.length).toBe(2);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('returns empty for nonexistent folder', () => {
    expect(getVideoFilesInFolderRecursive('/nonexistent/path')).toEqual([]);
  });
});

describe('getVideoFiles', () => {
  it('dispatches to flat when recursive=false', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tvb-test-'));
    fs.mkdirSync(path.join(tmpDir, 'sub'));
    fs.writeFileSync(path.join(tmpDir, 'root.mp4'), 'fake');
    fs.writeFileSync(path.join(tmpDir, 'sub', 'nested.mp4'), 'fake');
    const result = getVideoFiles(tmpDir, false);
    expect(result.length).toBe(1);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('dispatches to recursive when recursive=true', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tvb-test-'));
    fs.mkdirSync(path.join(tmpDir, 'sub'));
    fs.writeFileSync(path.join(tmpDir, 'root.mp4'), 'fake');
    fs.writeFileSync(path.join(tmpDir, 'sub', 'nested.mp4'), 'fake');
    const result = getVideoFiles(tmpDir, true);
    expect(result.length).toBe(2);
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('folderHasVideos', () => {
  it('returns true when folder has videos', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tvb-test-'));
    fs.writeFileSync(path.join(tmpDir, 'test.mp4'), 'fake');
    expect(folderHasVideos(tmpDir)).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('returns false for empty folder', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tvb-test-'));
    expect(folderHasVideos(tmpDir)).toBe(false);
    fs.rmSync(tmpDir, { recursive: true });
  });
});
