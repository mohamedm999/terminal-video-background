import * as fs from 'fs';
import * as path from 'path';
import { VideoValidationResult, SUPPORTED_VIDEO_EXTENSIONS } from '../types';
import { resolveVideoPath } from './paths';

export function validateVideoPath(videoPath: string): VideoValidationResult {
  if (!videoPath || videoPath.trim() === '') {
    return { valid: false, message: 'No video path provided' };
  }

  const resolved = resolveVideoPath(videoPath);

  if (!fs.existsSync(resolved)) {
    return { valid: false, message: `File not found: ${resolved}` };
  }

  try {
    const stat = fs.statSync(resolved);
    if (!stat.isFile()) {
      return { valid: false, message: `Not a file: ${resolved}` };
    }

    if (stat.size === 0) {
      return { valid: false, message: 'File is empty' };
    }

    if (stat.size > 500 * 1024 * 1024) {
      return { valid: false, message: `File too large: ${(stat.size / 1024 / 1024).toFixed(1)}MB` };
    }
  } catch {
    return { valid: false, message: `Cannot read file: ${resolved}` };
  }

  const ext = path.extname(resolved).toLowerCase();
  if (!SUPPORTED_VIDEO_EXTENSIONS.includes(ext)) {
    return { valid: false, message: `Unsupported: ${ext}` };
  }

  return { valid: true, message: 'OK', resolvedPath: resolved };
}

export function validateFolder(folderPath: string): boolean {
  if (!folderPath || folderPath.trim() === '') return false;
  const resolved = resolveVideoPath(folderPath);
  try {
    return fs.existsSync(resolved) && fs.statSync(resolved).isDirectory();
  } catch {
    return false;
  }
}

export function getVideoFilesInFolder(folderPath: string): string[] {
  const resolved = resolveVideoPath(folderPath);
  try {
    if (!fs.existsSync(resolved)) return [];
    return fs.readdirSync(resolved)
      .filter(f => SUPPORTED_VIDEO_EXTENSIONS.includes(path.extname(f).toLowerCase()))
      .map(f => path.join(resolved, f));
  } catch {
    return [];
  }
}

export function getVideoFilesInFolderRecursive(folderPath: string): string[] {
  const resolved = resolveVideoPath(folderPath);
  try {
    if (!fs.existsSync(resolved)) return [];
    const entries = fs.readdirSync(resolved, { recursive: true }) as string[];
    return entries
      .filter(f => typeof f === 'string' && SUPPORTED_VIDEO_EXTENSIONS.includes(path.extname(f).toLowerCase()))
      .map(f => path.join(resolved, f));
  } catch {
    return [];
  }
}

export function getVideoFiles(folderPath: string, recursive: boolean): string[] {
  return recursive
    ? getVideoFilesInFolderRecursive(folderPath)
    : getVideoFilesInFolder(folderPath);
}

export function folderHasVideos(folderPath: string, recursive = false): boolean {
  return getVideoFiles(folderPath, recursive).length > 0;
}

export function clampOpacity(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function clampPercentage(v: number): number {
  return Math.max(0, Math.min(200, v));
}

export function clampPlaybackRate(v: number): number {
  return Math.max(0.25, Math.min(4, v));
}

export function clampBlur(v: number): number {
  return Math.max(0, Math.min(20, v));
}
