#!/usr/bin/env bash
# Attach-or-create a tmux session, then either inject a skill slash-command
# into an already-running `claude` REPL, or start `claude "<skill>"` fresh.
# If no terminal window is attached to the session yet, opens one in
# Ghostty (the default terminal here — NOT Apple's Terminal.app) so the
# result is actually visible (raising an app to the foreground does NOT
# make it display a specific tmux session). If a window is already
# attached somewhere, just brings the given app forward instead of
# opening a redundant one.
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

# tmux send-keys above only reaches the session's pty — it produces
# nothing VISIBLE unless some terminal window is actually attached to
# this session. Raising an app to the foreground (below) does NOT make
# that app show this particular session; if nothing is attached yet, the
# skill just runs invisibly. So: check for an attached client first, and
# if there isn't one, actually attach one via Ghostty — confirmed working
# with `open -na Ghostty.app --args -e tmux attach-session -t "$SESSION"`.
# Note -e needs each word as a separate argv element (xterm convention,
# NOT a single shell-string) — quoting the command as one string makes
# Ghostty try to exec a literal binary named "tmux attach-session -t
# ...", which fails silently and falls back to a plain shell.
if [[ -z "$(tmux list-clients -t "$SESSION" 2>/dev/null)" ]]; then
    open -na Ghostty.app --args -e tmux attach-session -t "$SESSION"
else
    # Already attached and visible somewhere — just bring the requested
    # app forward. Don't let a missing/renamed app fail the whole script;
    # the tmux send-keys above already did the actual work. Ghostty (not
    # Apple's Terminal.app) is the fallback of last resort.
    if ! open -a "$APP_NAME" 2>/dev/null; then
        for fallback in "cmux Nightly" "Ghostty" "iTerm"; do
            open -a "$fallback" 2>/dev/null && break
        done
    fi
fi
# Guard against the (unlikely) case where every fallback also failed to
# open — tmux send-keys above already succeeded, so the script should
# still report success rather than leak a stale nonzero exit status.
true
