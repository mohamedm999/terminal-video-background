# Terminal Video Background

Display looping MP4/WebM video backgrounds behind your integrated terminal in VS Code.

## Features

- **Video Backgrounds**: Display MP4, WebM, OGG, or GIF videos behind the terminal
- **Visual Controls**: Adjust opacity, blur, brightness, and saturation
- **Crossfade Transitions**: Smooth crossfade when switching videos (500ms)
- **Auto-Loop**: Videos loop continuously
- **Muted by Default**: No audio distraction
- **Workspace Support**: Different videos for different projects (workspace-scoped settings)
- **Random Mode**: Automatically rotate through videos in a folder (Fisher-Yates, no-repeat)
- **Recursive Folder Scan**: Scan subdirectories for videos
- **Persistent Settings**: Remember your preferences
- **Safe**: Automatic backups before any modifications
- **Auto-Restore**: Recover automatically after VS Code updates
- **Schema Migration**: Automatic settings migration across versions
- **Diagnostics**: View extension status and patch information

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` to open Extensions
3. Search for "Terminal Video Background"
4. Click Install

### From VSIX

1. Download the latest `.vsix` file from [Releases](https://github.com/your-username/terminal-video-background/releases)
2. In VS Code, press `Ctrl+Shift+P`
3. Run "Extensions: Install from VSIX..."
4. Select the downloaded file

## Quick Start

1. Press `Ctrl+Shift+P` to open Command Palette
2. Run "Terminal Video: Select Video"
3. Choose your video file
4. The video will appear behind your terminal!

## Commands

| Command | Description |
|---------|-------------|
| `Terminal Video: Enable` | Enable video background |
| `Terminal Video: Disable` | Disable video background |
| `Terminal Video: Select Video` | Choose a video file |
| `Terminal Video: Restore Default` | Reset to defaults |
| `Terminal Video: Reload Background` | Refresh the video |
| `Terminal Video: Open Settings` | Open extension settings |
| `Terminal Video: Toggle` | Toggle on/off |
| `Terminal Video: Random Video` | Set random mode with a folder |
| `Terminal Video: Next Random Video` | Switch to next random video |
| `Terminal Video: Select Workspace Video` | Set workspace-specific video |
| `Terminal Video: Clear Workspace Video` | Remove workspace video override |
| `Terminal Video: Show Diagnostics` | View patch status and version info |

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `terminalVideo.enabled` | boolean | `false` | Enable/disable extension |
| `terminalVideo.video` | string | `""` | Path to video file |
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
| `terminalVideo.randomRecursive` | boolean | `false` | Scan subdirectories recursively |
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

This extension modifies VS Code's internal workbench files to inject the video element. This requires write access to VS Code's installation directory, which may need administrator privileges.

### VS Code says "Your Code installation appears to be corrupt"

This is expected. VS Code detects any modification to its internal files and shows this warning. **It is safe to dismiss.** Click "Don't Show Again" on the notification. This is the same behavior as other extensions that customize VS Code (like Custom CSS and JS Loader). The warning does not affect functionality.

### Will this work with VS Code updates?

Yes! The extension automatically detects VS Code updates and prompts to reapply the patch if needed.

### Can I use GIF files?

Yes! GIF files are supported as video backgrounds.

### Does this affect terminal performance?

No. The video is rendered using hardware acceleration and the `pointer-events: none` CSS property ensures it doesn't interfere with terminal interaction.

## Known Limitations

- Requires administrator privileges on first run
- Patch needs to be reapplied after VS Code updates
- Some video codecs may not be supported by Chromium
- Remote development (SSH/WSL) not supported

## Requirements

- VS Code 1.85.0 or higher
- Administrator privileges (for initial setup)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

## License

[MIT License](LICENSE)

## Support

- [GitHub Issues](https://github.com/your-username/terminal-video-background/issues)
- [Email](mailto:you@example.com)

---

**Enjoy your terminal videos!** 🎬
