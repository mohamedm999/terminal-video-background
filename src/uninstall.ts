import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const MARKER_START = '<!-- tvb-inject-start -->';
const MARKER_END = '<!-- tvb-inject-end -->';

function getWorkbenchHtmlPath(): string | null {
  const execPath = process.execPath;
  const appRoot = path.dirname(execPath);

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
    );
  }

  for (const dir of candidates) {
    const htmlFile = path.join(dir, '..', 'electron-browser', 'workbench.html');
    try {
      if (fs.existsSync(htmlFile)) {
        return htmlFile;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function stripPatch(content: string): string {
  const escapedStart = MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedEnd = MARKER_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\n?${escapedStart}[\\s\\S]*?${escapedEnd}\\n?`, 'g');
  return content.replace(regex, '');
}

function cleanup() {
  const htmlPath = getWorkbenchHtmlPath();

  if (htmlPath && fs.existsSync(htmlPath)) {
    try {
      const content = fs.readFileSync(htmlPath, 'utf-8');
      if (content.includes(MARKER_START)) {
        const cleaned = stripPatch(content);
        fs.writeFileSync(htmlPath, cleaned, 'utf-8');
        console.log('[TVB Uninstall] Patch removed from workbench.html');
      }
    } catch (error) {
      console.error('[TVB Uninstall] Failed to remove patch:', error);
    }
  }

  const backupPaths = htmlPath ? [`${htmlPath}.tvb-backup`] : [];
  for (const bp of backupPaths) {
    try {
      if (fs.existsSync(bp)) {
        fs.unlinkSync(bp);
      }
    } catch {
      // ignore
    }
  }

  const tempDir = os.tmpdir();
  try {
    const files = fs.readdirSync(tempDir);
    for (const f of files) {
      if (f.startsWith('tvb-') || f.startsWith('.tvb-')) {
        try {
          fs.unlinkSync(path.join(tempDir, f));
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // ignore
  }
}

cleanup();
