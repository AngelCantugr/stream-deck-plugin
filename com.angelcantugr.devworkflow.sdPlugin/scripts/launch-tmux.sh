#!/usr/bin/env bash
# Attach to the named tmux session or create it.
# Usage: launch-tmux.sh [session-name]  (default: main)

SESSION="${1:-main}"

osascript \
    -e 'tell application "Terminal"' \
    -e "    do script \"tmux attach-session -t '${SESSION}' 2>/dev/null || tmux new-session -s '${SESSION}'\"" \
    -e '    activate' \
    -e 'end tell'
