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
    # Give the shell a moment to finish its startup files (.zshrc etc.)
    # before we type into it — sending keys too early can get eaten.
    sleep 0.5
fi

# Best-effort REPL detection — Claude Code's CLI runs on Node, so "node" is
# used as a proxy for "claude REPL is already up". Verify on the real
# machine with `tmux display-message -p '#{pane_current_command}'` while
# `claude` is running; adjust the match below if it reports something else
# (e.g. an nvm shim). This check queries the tmux server directly, so it's
# the same regardless of which terminal app (Terminal/iTerm/cmux) is
# attached. Uses display-message (not list-panes) so it inspects the
# *active* pane — the one send-keys below actually targets — rather than
# always pane 0, which would be wrong if the window is split.
PANE_CMD="$(tmux display-message -t "$SESSION" -p '#{pane_current_command}')"

if [[ "$PANE_CMD" == "node" || "$PANE_CMD" == "claude" ]]; then
    tmux send-keys -t "$SESSION" "$SKILL" Enter
else
    tmux send-keys -t "$SESSION" "claude \"$SKILL\"" Enter
fi

# Don't let a missing/renamed terminal app fail the whole script — the
# tmux send-keys above already did the actual work. Fall back through a
# couple of common terminal apps so the key still shows success.
if ! open -a "$APP_NAME" 2>/dev/null; then
    for fallback in "iTerm" "Terminal"; do
        open -a "$fallback" 2>/dev/null && break
    done
fi
# Guard against the (unlikely) case where every fallback also failed to
# open — tmux send-keys above already succeeded, so the script should
# still report success rather than leak a stale nonzero exit status.
true
