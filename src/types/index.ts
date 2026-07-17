export interface TerminalVideoSettings {
  enabled: boolean;
  video: string;
  opacity: number;
  blur: number;
  brightness: number;
  saturation: number;
  objectFit: 'cover' | 'contain' | 'fill' | 'none';
  loop: boolean;
  muted: boolean;
  workspaceVideo: string;
  autoRestore: boolean;
  randomMode: boolean;
  randomFolder: string;
  randomRecursive: boolean;
  playbackRate: number;
}

export interface PatchInfo {
  version: string;
  timestamp: number;
  videoPath: string;
}

export interface VSCodePath {
  execPath: string;
  appRoot: string;
  workbenchPath: string;
  workbenchJsPath: string;
  workbenchHtmlPath: string;
  userHome: string;
}

export enum PatchStatus {
  NotPatched = 0,
  PatchedByOldVersion = 1,
  PatchedByCurrentVersion = 2,
}

export interface PatchResult {
  success: boolean;
  message: string;
  requiresRestart?: boolean;
}

export interface VideoValidationResult {
  valid: boolean;
  message: string;
  resolvedPath?: string;
}

export const EXTENSION_ID = 'terminal-video-background';
export const PATCH_MARKER_START = '// tvb-start';
export const PATCH_MARKER_END = '// tvb-end';
export const PATCH_VERSION_MARKER = 'tvb.ver';

export const DEFAULT_SETTINGS: TerminalVideoSettings = {
  enabled: true,
  video: '',
  opacity: 0.3,
  blur: 0,
  brightness: 100,
  saturation: 100,
  objectFit: 'cover',
  loop: true,
  muted: true,
  workspaceVideo: '',
  autoRestore: true,
  randomMode: false,
  randomFolder: '',
  randomRecursive: false,
  playbackRate: 1,
};

export const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.gif'];

export const CURRENT_SCHEMA_VERSION = 1;
