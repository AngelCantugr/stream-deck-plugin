# Claude Desktop Stream Deck Profile

A profile for Claude Desktop with 3 pages — Chat, Cowork, Code — plus a
second profile that auto-switches in whenever a terminal app is frontmost.

Behavior for every custom button here is defined in
`src/config/dev-workflow.config.ts` (Script Runner entries with id prefix
`skill-`, plus the existing `claude-desktop` App Launcher). **Physical key
placement is not codeable in this SDK** — it's manual drag-and-drop in the
Stream Deck app, same as every other button in this plugin. This doc is the
reference for that one-time manual assembly.

---

## 1. Overview

Two Stream Deck Profiles:

- **"Claude Desktop"** — 3 Folders (Chat / Cowork / Code) for paging while
  Claude Desktop itself is the app you're driving from.
- **"Terminal"** — a flat grid of the same Cowork/Code skill buttons, set to
  auto-switch in whenever Terminal, iTerm, or cmux is frontmost.

Both profiles use the *same* `skill-*` Script Runner buttons. Each button's
underlying script (`send-skill-to-session.sh`) is session-aware: if the
target tmux session already has `claude` running interactively, it types the
skill straight into that live REPL; otherwise it starts `claude` fresh with
the skill as its argument. So pressing "New PR" behaves identically whether
you're paging through Claude Desktop's Code folder or sitting in a terminal
that auto-switched the Stream Deck to the Terminal profile.

## 2. Folder → key map (Claude Desktop profile)

### Chat folder

| Action | configId | Notes |
|---|---|---|
| App Launcher | `claude-desktop` | Opens/focuses the Claude app. |

Intentionally thin — Claude Desktop has no documented Chat-tab shortcuts,
URL scheme, or CLI flag to jump into Chat specifically, so there's nothing
else to script here yet.

### Cowork folder

| Action | configId | Skill |
|---|---|---|
| App Launcher | `claude-desktop` | — |
| Script Runner | `skill-team-status` | `/dev-team:team-status` |
| Script Runner | `skill-po-status` | `/product-ownership:status` |
| Script Runner | `skill-gh-status` | `/github-project-management:status` |
| Script Runner | `skill-gh-daily` | `/github-project-management:daily-status` |

### Code folder

| Action | configId | Skill |
|---|---|---|
| App Launcher | `claude-desktop` | — |
| Script Runner | `skill-create-pr` | `/pr-workflow:create-pr` |
| Script Runner | `skill-commit-pr-mon` | `/pr-workflow:commit-push-pr-monitor` |
| Script Runner | `skill-clean-audit` | `/clean-code:audit` |
| Script Runner | `skill-watch-issues` | `/engineering-core:watch-issues` |
| Script Runner | `skill-devbasic-stat` | `/dev-basic:status` |
| Script Runner | `skill-devbasic-cfg` | `/dev-basic:configure` |

Plus native Hotkey buttons — see §4.

## 3. Manual assembly steps

1. In the Stream Deck app, create a new Profile named **"Claude Desktop"**.
2. Add 3 keys with the native **Folder** action, labeled Chat / Cowork /
   Code.
3. Open each Folder and drag in the actions from the tables in §2. For each
   Script Runner / App Launcher key, open its property inspector and pick
   the matching `configId` from the dropdown (populated live from
   `dev-workflow.config.ts`).
4. Create a second Profile named **"Terminal"**.
5. Place the 10 `skill-*` Script Runner buttons from the Cowork/Code tables
   directly on its grid — no folders needed, it's one page.
6. Set up Auto-Switch on the Terminal profile — see §5.

## 4. Native Hotkey setup for the Code tab

Claude Desktop's documented keyboard shortcuts only apply in the **Code**
tab (`code.claude.com/docs/en/desktop`). There's no CLI/URL way to trigger
them, so add them as Stream Deck's built-in **Hotkey** system action
(drag onto a key, configure the key combo in its native property
inspector) — no plugin code involved. Suggested set, placed in the Code
folder alongside the skill buttons:

| Hotkey | Action |
|---|---|
| Cmd+N | New session |
| Cmd+Shift+D | Toggle diff |
| Cmd+Shift+P | Toggle preview |
| Ctrl+\` | Toggle terminal |
| Cmd+Shift+M | Permission mode menu |
| Cmd+Shift+I | Model menu |

## 5. Auto-Switch Profile config

On the **"Terminal"** profile: open Profile settings → enable Auto-Switch →
add **all three** apps you use to view tmux sessions: Terminal, iTerm, and
`cmux Nightly`. Stream Deck auto-switch matches by frontmost *app*, and tmux
itself is headless (not a matchable app), so each terminal app that might
host the session needs its own entry.

## 6. Known caveats

- **Chat folder is thin.** No Chat-tab automation surface is documented
  anywhere for Claude Desktop — revisit if that changes.
- **REPL-detection heuristic is unverified.** `send-skill-to-session.sh`
  guesses a live `claude` REPL by checking if the pane's current command is
  `node` or `claude`. Confirm on your machine with
  `tmux list-panes -F '#{pane_current_command}'` while `claude` is actually
  running, and adjust the script if it reports something else (e.g. an nvm
  shim).
- **No locking.** Firing two skill buttons at the same tmux session back to
  back can interleave keystrokes into one REPL prompt. Not handled — this is
  a manual single-press workflow, not a queueing system.
- **cmux integration is tmux-only.** This setup relies on cmux hosting a
  tmux session (`cmux surface resume --kind tmux`), which is cmux's own
  documented pattern for persistent sessions — not on cmux's separate
  Unix-socket API (workspace creation, direct pane input, screen reading).
  That API exists but its CLI syntax isn't published anywhere this research
  could reach (cmux's README defers to `cmux.com/docs/api`). A tighter
  native-cmux integration bypassing tmux entirely would need that reference
  fetched directly.
