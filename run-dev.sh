#!/bin/bash
set -e

EXT_ID="timer@lbgracioso.net"
EXT_DIR="$HOME/.local/share/gnome-shell/extensions/$EXT_ID"
SRC_DIR="$(pwd)"  # assumes you run the script from project root - change if needed

echo "Installing extension to $EXT_DIR..."
mkdir -p "$EXT_DIR"
rsync -a --delete "$SRC_DIR/" "$EXT_DIR/"

echo "Enabling extension: $EXT_ID"
gnome-extensions enable "$EXT_ID" || true

# Start nested GNOME Shell if not already running
if ! pgrep -f "gnome-shell --nested --wayland" > /dev/null; then
    echo "Starting nested GNOME Shell..."
    dbus-run-session -- gnome-shell --nested --wayland &
    NESTED_PID=$!
    sleep 3
fi

# Keep script alive if nested started here
if [ -n "$NESTED_PID" ]; then
    wait $NESTED_PID
fi
