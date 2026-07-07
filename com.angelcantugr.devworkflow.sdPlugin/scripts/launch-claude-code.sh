#!/usr/bin/env bash
# Open a new Terminal window and start claude (Claude Code CLI)
# Requires: `claude` on PATH (install via: npm install -g @anthropic-ai/claude-code)

osascript \
    -e 'tell application "Terminal"' \
    -e '    set w to do script "claude"' \
    -e '    set bounds of front window to {100, 100, 1400, 900}' \
    -e '    activate' \
    -e 'end tell'
