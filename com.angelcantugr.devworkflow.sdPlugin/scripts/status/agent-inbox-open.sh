#!/usr/bin/env bash
# Press action for the Agent Inbox tile: mark everything read, then open the
# agent-inbox skill in the "code" tmux session so the results are on screen.
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

DIR="${AGENT_RESULTS_DIR:-$HOME/.local/share/agent-results}"
mkdir -p "$DIR"
touch "$DIR/.streamdeck-last-seen"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$SCRIPT_DIR/../send-skill-to-session.sh" code "/agent-results:agent-inbox" "cmux Nightly"
