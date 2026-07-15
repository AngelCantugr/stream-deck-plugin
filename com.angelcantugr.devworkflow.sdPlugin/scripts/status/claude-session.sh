#!/usr/bin/env bash
# Status source: Claude Code REPL state in a tmux session.
# Usage: claude-session.sh <session-name>
#
# States: off = no tmux/session/REPL · ok = REPL running · alert = REPL
# rang the terminal bell (needs input; tmux latches the bell flag per
# window until the window is visited).
#
# Contract (Status Tile): last non-empty stdout line is one JSON object
#   {"title": string, "value": string, "state": "ok"|"warn"|"alert"|"off"}
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

SESSION="${1:?session name required}"

off() { printf '{"title":"cc:%s","value":"–","state":"off"}\n' "$SESSION"; exit 0; }

command -v tmux >/dev/null 2>&1 || off
tmux has-session -t "$SESSION" 2>/dev/null || off

# Same REPL heuristic as send-skill-to-session.sh: Claude Code runs on Node.
PANE_CMD="$(tmux display-message -t "$SESSION" -p '#{pane_current_command}' 2>/dev/null)" || off
if [[ "$PANE_CMD" != "node" && "$PANE_CMD" != "claude" ]]; then
    printf '{"title":"cc:%s","value":"idle","state":"off"}\n' "$SESSION"
    exit 0
fi

bells=$(tmux list-windows -t "$SESSION" -F '#{window_bell_flag}' 2>/dev/null | grep -c '^1' || true)
if [[ "$bells" -gt 0 ]]; then
    printf '{"title":"cc:%s","value":"input!","state":"alert"}\n' "$SESSION"
else
    printf '{"title":"cc:%s","value":"live","state":"ok"}\n' "$SESSION"
fi
