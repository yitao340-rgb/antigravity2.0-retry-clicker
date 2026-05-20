#!/bin/bash

# ==============================================================================
# Antigravity 2.0 Auto-Clicker Automated Installer for macOS
# ==============================================================================

set -e

# Premium Interface Colors
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BOLD="\033[1m"
NC="\033[0m" # No Color

echo -e "${BLUE}${BOLD}================================================================${NC}"
echo -e "${BLUE}${BOLD}   🚀 Antigravity 2.0 Auto-Clicker Background Daemon Installer   ${NC}"
echo -e "${BLUE}${BOLD}================================================================${NC}"
echo ""

# 1. Define permanent installation directory
INSTALL_DIR="$HOME/.antigravity-clicker"
PLIST_NAME="com.yitao.antigravity.clicker.plist"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME"

echo -e "📦 Permanent installation target: ${BOLD}$INSTALL_DIR${NC}"
mkdir -p "$INSTALL_DIR"

# 2. Check for python3
PYTHON_BIN=$(which python3 || echo "/usr/bin/python3")
if ! command -v "$PYTHON_BIN" &> /dev/null; then
    echo -e "${RED}❌ Error: Python3 is not installed or not in PATH.${NC}"
    echo -e "Please install Python3 or Xcode Command Line Tools first."
    exit 1
fi
echo -e "📡 Found Python3 at: ${BOLD}$PYTHON_BIN${NC}"

# 3. Copy scripts to the permanent directory
echo -e "🚚 Copying scripts to the target folder..."
cp clicker.js "$INSTALL_DIR/"
cp injector.py "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/injector.py"

# 4. Generate macOS launchd plist configuration dynamically
echo -e "⚙️ Generating launchd plist agent configuration..."
cat <<EOF > "$INSTALL_DIR/$PLIST_NAME"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.yitao.antigravity.clicker</string>
    <key>ProgramArguments</key>
    <array>
        <string>$PYTHON_BIN</string>
        <string>-u</string>
        <string>$INSTALL_DIR/injector.py</string>
    </array>
    <key>WatchPaths</key>
    <array>
        <string>$HOME/Library/Application Support/Antigravity/DevToolsActivePort</string>
    </array>
    <key>StandardOutPath</key>
    <string>$INSTALL_DIR/launchd_output.log</string>
    <key>StandardErrorPath</key>
    <string>$INSTALL_DIR/launchd_error.log</string>
</dict>
</plist>
EOF

# 5. Clean up old configuration if present
if launchctl list | grep -q "com.yitao.antigravity.clicker"; then
    echo -e "🔄 Unloading existing launchd agent..."
    launchctl unload "$PLIST_PATH" 2>/dev/null || true
fi

# 6. Install plist into Library LaunchAgents
echo -e "🛡️ Installing plist to ~/Library/LaunchAgents/..."
cp "$INSTALL_DIR/$PLIST_NAME" "$PLIST_PATH"

# 7. Load and start launchd agent
echo -e "⚡ Loading and starting the daemon service..."
launchctl load "$PLIST_PATH"
launchctl start com.yitao.antigravity.clicker

echo ""
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo -e "${GREEN}${BOLD}   🎉 Installation Completed Successfully!                     ${NC}"
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo -e "🟢 The clicker background daemon is now active and guarding Antigravity 2.0."
echo -e "💡 How it works:"
echo -e "   1. Every time you open or restart the Antigravity 2.0 client, the daemon starts."
echo -e "   2. It continuously checks for page transitions or refreshes every 3 seconds."
echo -e "   3. If you press ${BOLD}Cmd+R${NC} to refresh, it automatically reinjects within 3s."
echo -e "   4. When you close the app, the daemon exits cleanly to use zero resources."
echo ""
echo -e "📝 Logs directory: ${BOLD}$INSTALL_DIR/launchd_output.log${NC}"
echo -e "⚙️ Settings: Click the floating badge in the bottom-right corner to open the UI panel."
echo ""
