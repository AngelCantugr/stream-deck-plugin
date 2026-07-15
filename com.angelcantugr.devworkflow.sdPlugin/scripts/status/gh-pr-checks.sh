#!/usr/bin/env bash
# Status source: CI check status for the current branch's PR in a repo.
# Usage: gh-pr-checks.sh <repo-dir>
#
# Contract (Status Tile): last non-empty stdout line is one JSON object
#   {"title": string, "value": string, "state": "ok"|"warn"|"alert"|"off"}
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

REPO="${1:?repo dir required}"

off() { printf '{"title":"PR CI","value":"–","state":"off"}\n'; exit 0; }

cd "$REPO" 2>/dev/null || off
command -v gh >/dev/null 2>&1 || off

# No PR for the current branch (or no auth/network) → off, not an error.
checks=$(gh pr checks --json bucket 2>/dev/null) || off

fail=$(printf '%s' "$checks" | python3 -c 'import json,sys; b=[c["bucket"] for c in json.load(sys.stdin)]; print(b.count("fail"))' 2>/dev/null) || off
pending=$(printf '%s' "$checks" | python3 -c 'import json,sys; b=[c["bucket"] for c in json.load(sys.stdin)]; print(b.count("pending"))' 2>/dev/null) || off

if [[ "$fail" -gt 0 ]]; then
    printf '{"title":"PR CI","value":"%s✗","state":"alert"}\n' "$fail"
elif [[ "$pending" -gt 0 ]]; then
    printf '{"title":"PR CI","value":"%s…","state":"warn"}\n' "$pending"
else
    printf '{"title":"PR CI","value":"✓","state":"ok"}\n'
fi
