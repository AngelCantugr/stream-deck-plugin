#!/usr/bin/env bash
# Open a new Terminal window with NeoVim.
# Prefers Neovide if available, falls back to nvim in Terminal.

if command -v neovide &>/dev/null; then
    open -a Neovide
elif open -a Neovide 2>/dev/null; then
    : # launched via open -a
else
    osascript \
        -e 'tell application "Terminal"' \
        -e '    do script "nvim"' \
        -e '    activate' \
        -e 'end tell'
fi
