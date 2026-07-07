#!/usr/bin/env bash
# Attach-or-create a tmux session, then either inject a skill slash-command
# into an already-running `claude` REPL, or start `claude "<skill>"` fresh.
# Finally brings the given app to the foreground (Terminal/iTerm/cmux —
# whichever app the caller is actually using to view that tmux session;
# `tmux send-keys` itself doesn't care which terminal app is attached).
# Usage: send-skill-to-session.sh <session-name> <skill-arg> <app-name>
set -euo pipefail

SESSION="${1:?session name required}"
SKILL="${2:?skill arg required}"
APP_NAME="${3:?terminal app name required, e.g. Terminal / iTerm / cmux Nightly}"

if ! tmux has-session -t "$SESSION" 2>/dev/null; then
    tmux new-session -d -s "$SESSION"
fi

# Best-effort REPL detection — Claude Code's CLI runs on Node, so "node" is
# used as a proxy for "claude REPL is already up". Verify on the real
# machine with `tmux list-panes -F '#{pane_current_command}'` while `claude`
# is running; adjust the match below if it reports something else (e.g. an
# nvm shim). This check queries the tmux server directly, so it's the same
# regardless of which terminal app (Terminal/iTerm/cmux) is attached.
PANE_CMD="$(tmux list-panes -t "$SESSION" -F '#{pane_current_command}' | head -1)"

if [[ "$PANE_CMD" == "node" || "$PANE_CMD" == "claude" ]]; then
    tmux send-keys -t "$SESSION" "$SKILL" Enter
else
    tmux send-keys -t "$SESSION" "claude \"$SKILL\"" Enter
fi

open -a "$APP_NAME"
