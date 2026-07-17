import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { VSCodePath } from '../types';
import { Logger } from '../services/logger';

export function getVSCodePaths(): VSCodePath {
  const execPath = process.execPath;
  const appRoot = path.dirname(execPath);

  const workbenchPath = findWorkbenchPath(appRoot);
  const workbenchJsPath = path.join(workbenchPath, 'workbench.desktop.main.js');
  const workbenchHtmlPath = findWorkbenchHtml(workbenchPath);

  Logger.info(`execPath: ${execPath}`);
  Logger.info(`appRoot: ${appRoot}`);
  Logger.info(`workbenchPath: ${workbenchPath}`);
  Logger.info(`workbenchHtmlPath: ${workbenchHtmlPath}`);
  Logger.info(`workbenchHtmlPath exists: ${fs.existsSync(workbenchHtmlPath)}`);

  return {
    execPath,
    appRoot,
    workbenchPath,
    workbenchJsPath,
    workbenchHtmlPath,
    userHome: os.homedir(),
  };
}

function findWorkbenchPath(appRoot: string): string {
  const candidates: string[] = [];

  if (process.platform === 'win32') {
    candidates.push(
      path.join(appRoot, 'resources', 'app', 'out', 'vs', 'workbench'),
      path.join(appRoot, 'out', 'vs', 'workbench'),
    );
    try {
      const entries = fs.readdirSync(appRoot);
      for (const entry of entries) {
        const full = path.join(appRoot, entry);
        if (fs.statSync(full).isDirectory()) {
          candidates.push(path.join(full, 'resources', 'app', 'out', 'vs', 'workbench'));
        }
      }
    } catch {
      // ignore
    }
  } else if (process.platform === 'darwin') {
    candidates.push(
      path.join(appRoot, 'Resources', 'app', 'out', 'vs', 'workbench'),
      path.join(appRoot, 'out', 'vs', 'workbench'),
    );
  } else {
    candidates.push(
      path.join(appRoot, 'resources', 'app', 'out', 'vs', 'workbench'),
      path.join(appRoot, 'out', 'vs', 'workbench'),
      '/usr/share/code/resources/app/out/vs/workbench',
      '/usr/lib/code/resources/app/out/vs/workbench',
    );
  }

  Logger.info(`Workbench candidates: ${candidates.join('\n  ')}`);

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const jsFile = path.join(p, 'workbench.desktop.main.js');
        if (fs.existsSync(jsFile)) {
          Logger.info(`Found workbench at: ${p}`);
          return p;
        }
      }
    } catch {
      continue;
    }
  }

  Logger.warn(`No workbench found, returning first candidate: ${candidates[0]}`);
  return candidates[0];
}

function findWorkbenchHtml(workbenchPath: string): string {
  const candidates = [
    path.join(workbenchPath, '..', 'electron-browser', 'workbench.html'),
    path.join(workbenchPath, '..', 'electron-browser', 'workbench', 'workbench.html'),
    path.join(workbenchPath, '..', 'code', 'electron-browser', 'workbench', 'workbench.html'),
    path.join(workbenchPath, '..', 'electron-sandbox', 'workbench', 'workbench.html'),
    path.join(workbenchPath, '..', 'code', 'electron-sandbox', 'workbench', 'workbench.html'),
  ];
  for (const c of candidates) {
    const resolved = path.resolve(c);
    if (fs.existsSync(resolved)) {
      Logger.info(`Found workbench.html at: ${resolved}`);
      return resolved;
    }
  }
  const fallback = path.resolve(candidates[1]);
  Logger.warn(`workbench.html not found, using fallback: ${fallback}`);
  return fallback;
}

export function resolveVideoPath(videoPath: string): string {
  if (!videoPath) {
    return '';
  }

  let resolved = videoPath.trim();

  if (process.platform === 'win32') {
    resolved = resolved.replace(/\//g, '\\');
  }

  resolved = resolved.replace(/^~/, os.homedir());

  if (!path.isAbsolute(resolved)) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (workspaceFolder) {
      resolved = path.join(workspaceFolder, resolved);
    }
  }

  return resolved;
}

export function isVideoFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ['.mp4', '.webm', '.ogg', '.gif'].includes(ext);
}
