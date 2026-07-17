#!/bin/bash
set -e

REPO="mohamedm999/terminal-video-background"
VERSION="v1.0.0"
FILE="terminal-video-background-1.0.0.vsix"
URL="https://github.com/$REPO/releases/download/$VERSION/$FILE"
TMP="/tmp/tvb-install.vsix"

echo "Downloading Terminal Video Background $VERSION..."
curl -fSL "$URL" -o "$TMP"

echo "Installing extension..."
code --install-extension "$TMP"

rm -f "$TMP"

echo ""
echo "Installed! Next steps:"
echo "  1. Restart VS Code as Admin (Windows) or with sudo (macOS/Linux)"
echo "  2. Ctrl+Shift+P → 'Terminal Video: Enable'"
echo "  3. Click 'Restart Now'"
