# Changelog

All notable changes to the "Terminal Video Background" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-16

### Added

- Display MP4/WebM/OGG/GIF video behind integrated terminal
- Opacity control (0-100%)
- Blur effect (0-20px)
- Brightness control (0-200%)
- Saturation control (0-200%)
- Object fit options (cover, contain, fill, none)
- Playback rate control (0.25x - 4x)
- Loop control
- Mute control
- Workspace-specific video overrides (per-workspace settings)
- Random video mode with Fisher-Yates shuffle (no-repeat cycle)
- Recursive subdirectory scanning for random mode
- Next random video command
- Crossfade transition when switching videos (500ms)
- Auto-restore after VS Code updates (detects version/file changes)
- Schema versioning with automatic settings migration
- Show Diagnostics command (patch status, version info)
- Enable/Disable commands
- Video selection dialog
- Settings panel integration
- Automatic backup before patching
- Rollback/restore capability
- 96 automated tests

### Security

- Never executes arbitrary JavaScript
- Validates all file paths
- Uses marker-based injection for clean removal
- Backup created before any modifications
