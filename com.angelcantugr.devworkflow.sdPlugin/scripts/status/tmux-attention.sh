#!/usr/bin/env bash
# Status source: tmux session count + attention flags.
#
# "alert" when any window has its bell flag set (Claude Code and other TUIs
# ring the terminal bell when they need input — tmux latches it per window
# until the window is visited), otherwise "ok" with the session count.
#
# Contract (Status Tile): last non-empty stdout line is one JSON object
#   {"title": string, "value": string, "state": "ok"|"warn"|"alert"|"off"}
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v tmux >/dev/null 2>&1 || ! tmux list-sessions >/dev/null 2>&1; then
    printf '{"title":"tmux","value":"–","state":"off"}\n'
    exit 0
fi

sessions=$(tmux list-sessions 2>/dev/null | wc -l | tr -d ' ')
bells=$(tmux list-windows -a -F '#{window_bell_flag}' 2>/dev/null | grep -c '^1' || true)

if [[ "$bells" -gt 0 ]]; then
    printf '{"title":"needs input","value":"%s","state":"alert"}\n' "$bells"
else
    printf '{"title":"tmux","value":"%s","state":"ok"}\n' "$sessions"
fi
