#!/usr/bin/env bash
# Status source: unread agent-results count.
#
# Counts result files under ~/.local/share/agent-results/<repo>/ that are
# newer than the .streamdeck-last-seen marker (see agent-inbox-open.sh,
# which touches the marker when the inbox is opened from the tile).
#
# Contract (Status Tile): last non-empty stdout line is one JSON object
#   {"title": string, "value": string, "state": "ok"|"warn"|"alert"|"off"}
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

DIR="${AGENT_RESULTS_DIR:-$HOME/.local/share/agent-results}"
MARKER="$DIR/.streamdeck-last-seen"

if [[ ! -d "$DIR" ]]; then
    printf '{"title":"Inbox","value":"–","state":"off"}\n'
    exit 0
fi

# latest.md files are convenience symlinks maintained by agent-result-write,
# not distinct results — exclude them so counts aren't doubled.
if [[ -f "$MARKER" ]]; then
    count=$(find "$DIR" -type f -name '*.md' ! -name 'latest.md' -newer "$MARKER" 2>/dev/null | wc -l | tr -d ' ')
else
    count=$(find "$DIR" -type f -name '*.md' ! -name 'latest.md' 2>/dev/null | wc -l | tr -d ' ')
fi

state="ok"
[[ "$count" -gt 0 ]] && state="alert"

printf '{"title":"Inbox","value":"%s","state":"%s"}\n' "$count" "$state"
