# Terminal Video Background

Display looping MP4/WebM video backgrounds behind your integrated terminal in VS Code.

## Features

- **Video Backgrounds**: Display MP4, WebM, OGG, or GIF videos behind the terminal
- **Bundled Default Video**: Works out of the box with a built-in video
- **Visual Controls**: Adjust opacity, blur, brightness, and saturation
- **Crossfade Transitions**: Smooth crossfade when switching videos
- **Auto-Loop**: Videos loop continuously
- **Muted by Default**: No audio distraction
- **Workspace Support**: Different videos for different projects
- **Random Mode**: Rotate through videos in a folder (no-repeat shuffle)
- **Auto-Restore**: Recover automatically after VS Code updates
- **Safe**: Automatic backups before any modifications

## Installation

### From `.vsix` (Recommended)

1. Download the latest `.vsix` file from [Releases](https://github.com/mohamedm999/terminal-video-background/releases)
2. Install via command line:
   ```bash
   code --install-extension terminal-video-background-1.0.0.vsix
   ```
   **Or** install from VS Code:
   1. Press `Ctrl+Shift+P`
   2. Run **"Extensions: Install from VSIX..."**
   3. Select the downloaded `.vsix` file

### Important: First-Time Setup

> **You must run VS Code as Administrator** (Windows) or with `sudo` (Linux/macOS) for the first activation, so the extension can patch VS Code's internal files.

After the patch is applied, VS Code will show a warning:

> *"Your Code installation appears to be corrupt"*

This is **normal and safe**. Click **"Don't Show Again"** to dismiss it permanently. You can also install the [Fix VSCode Checksums](https://marketplace.visualstudio.com/items?itemName=lehni.vscode-fix-checksums) extension to remove this warning.

## Quick Start

1. Install the extension (see above)
2. **Restart VS Code** as Administrator
3. Press `Ctrl+Shift+P` and run **"Terminal Video: Enable"**
4. Click **"Restart Now"** when prompted
5. The default video background appears behind your terminal!

To use your own video:
1. Press `Ctrl+Shift+P`
2. Run **"Terminal Video: Select Video"**
3. Choose your MP4/WebM file

## Commands

| Command | Description |
|---------|-------------|
| `Terminal Video: Enable` | Enable video background |
| `Terminal Video: Disable` | Disable video background |
| `Terminal Video: Select Video` | Choose a video file |
| `Terminal Video: Toggle` | Toggle on/off |
| `Terminal Video: Restore Default` | Reset to defaults |
| `Terminal Video: Reload Background` | Refresh the video |
| `Terminal Video: Open Settings` | Open extension settings |
| `Terminal Video: Random Video` | Set random mode with a folder |
| `Terminal Video: Next Random Video` | Switch to next random video |
| `Terminal Video: Select Workspace Video` | Set workspace-specific video |
| `Terminal Video: Clear Workspace Video` | Remove workspace video override |
| `Terminal Video: Show Diagnostics` | View patch status and version info |

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `terminalVideo.enabled` | boolean | `true` | Enable/disable extension |
| `terminalVideo.video` | string | `""` | Path to video file (empty = bundled default) |
| `terminalVideo.opacity` | number | `0.3` | Video opacity (0-1) |
| `terminalVideo.blur` | number | `0` | Blur amount (0-20px) |
| `terminalVideo.brightness` | number | `100` | Brightness (0-200%) |
| `terminalVideo.saturation` | number | `100` | Saturation (0-200%) |
| `terminalVideo.objectFit` | string | `cover` | How video fits (cover/contain/fill/none) |
| `terminalVideo.loop` | boolean | `true` | Loop video |
| `terminalVideo.muted` | boolean | `true` | Mute audio |
| `terminalVideo.playbackRate` | number | `1` | Playback speed (0.25-4) |
| `terminalVideo.workspaceVideo` | string | `""` | Workspace-specific video |
| `terminalVideo.randomMode` | boolean | `false` | Enable random mode |
| `terminalVideo.randomFolder` | string | `""` | Folder for random videos |
| `terminalVideo.randomRecursive` | boolean | `false` | Scan subdirectories |
| `terminalVideo.autoRestore` | boolean | `true` | Auto-restore after updates |

### Example settings.json

```json
{
  "terminalVideo.enabled": true,
  "terminalVideo.video": "C:/Videos/background.mp4",
  "terminalVideo.opacity": 0.3,
  "terminalVideo.blur": 2,
  "terminalVideo.brightness": 80,
  "terminalVideo.objectFit": "cover"
}
```

## FAQ

### Why do I need administrator privileges?

This extension modifies VS Code's internal workbench files to inject the video element. This requires write access to VS Code's installation directory.

### VS Code says "Your Code installation appears to be corrupt"

This is expected and safe. Click "Don't Show Again" to dismiss it. You can also install [Fix VSCode Checksums](https://marketplace.visualstudio.com/items?itemName=lehni.vscode-fix-checksums) to suppress the warning entirely.

### Will this work after VS Code updates?

Yes. The extension detects updates and prompts to reapply the patch automatically.

### Does this affect terminal performance?

No. The video uses hardware acceleration and `pointer-events: none` so it doesn't interfere with terminal interaction.

## Known Limitations

- Requires administrator privileges for patching
- Patch needs to be reapplied after VS Code updates
- Desktop VS Code only (not supported in VS Code Web, Remote SSH, or Codespaces)
- Some video codecs may not be supported by Chromium

## Requirements

- VS Code 1.85.0 or higher
- Administrator privileges (for initial setup)

## License

[MIT License](LICENSE)

## Support

- [GitHub Issues](https://github.com/mohamedm999/terminal-video-background/issues)

---

**Enjoy your terminal videos!**
