# Claude Desktop Stream Deck Profile

A profile for Claude Desktop with 3 pages — Chat, Cowork, Code — plus a
second profile that auto-switches in whenever a terminal app is frontmost.

Behavior for every custom button here is defined in
`src/config/dev-workflow.config.ts` (Script Runner entries with id prefix
`skill-`, plus the existing `claude-desktop` App Launcher). **Physical key
placement isn't hand-writable as TypeScript** — there's no JSON schema for
authoring a Stream Deck Profile from scratch. But per Elgato's own SDK docs
([Profiles guide](https://docs.elgato.com/streamdeck/sdk/guides/profiles)),
a Profile you build once in the app **can** be exported and bundled with
the plugin, so it ships and auto-installs like any other plugin asset
instead of staying a one-off outside the repo — see §7. This doc covers
both: the one-time manual build (§3) and how to bundle it afterward (§7).

See [sdk-capabilities-reference.md](sdk-capabilities-reference.md) for the
broader SDK survey this doc's design decisions are grounded in — in
particular §6, which **confirms** a Stream Deck plugin cannot detect the
frontmost macOS app at all (no windowing/focus API exists in the SDK),
which is exactly why the "Terminal" auto-switch profile below has to be a
manual, native Stream Deck Profile setting rather than something this
plugin's code could do on its own.

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
7. Once you're happy with the "Claude Desktop" profile's layout, bundle it
   with the plugin so it's git-tracked and auto-installs going forward —
   see §7. (The "Terminal" profile stays local/unbundled — see §7's note
   on why.)

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

**"Claude Desktop" profile → Claude.app.** Confirmed working: the
top-level `manifest.json` of a `.sdProfile` bundle takes an
`"AppIdentifier"` field — a single app path string — that makes Stream
Deck switch to that profile automatically whenever the named app becomes
frontmost. Discovered by inspecting the existing "Tick Tick" profile
(`"AppIdentifier": "/Applications/TickTick.app"`) and confirmed by adding
the equivalent to this profile's own manifest:
```json
"AppIdentifier": "/Applications/Claude.app"
```
No GUI step needed for this one — set directly in the file, then a
Stream Deck app restart to pick it up. See
[profile-authoring-reference.md §2](profile-authoring-reference.md) for
the full field reference.

**"Terminal" profile → Terminal / iTerm / cmux.** This one still needs
the GUI: open Profile settings → enable Auto-Switch → add **all three**
apps you use to view tmux sessions. `AppIdentifier` above is a single
string, and no multi-app equivalent has been confirmed on disk — tmux
itself is headless (not a matchable app), so each terminal app that might
host the session needs its own entry, and until the multi-app JSON
encoding is found, that has to be done by hand in the app.

## 6. Known caveats

- **Chat folder is thin.** No Chat-tab automation surface is documented
  anywhere for Claude Desktop — revisit if that changes.
- **REPL-detection heuristic is unverified.** `send-skill-to-session.sh`
  guesses a live `claude` REPL by checking if the active pane's current
  command is `node` or `claude`. Confirm on your machine with
  `tmux display-message -p '#{pane_current_command}'` while `claude` is
  actually running, and adjust the script if it reports something else
  (e.g. an nvm shim).
- **No locking.** Firing two skill buttons at the same tmux session back to
  back can interleave keystrokes into one REPL prompt. Not handled — this is
  a manual single-press workflow, not a queueing system.
- **First press on a fresh session always opens in Terminal.app, not
  cmux.** Confirmed by real testing: raising an app to the foreground does
  NOT make it display a specific tmux session — `tmux send-keys` only
  reaches the session's pty, invisibly, unless some window is actually
  attached. `send-skill-to-session.sh` now checks `tmux list-clients` and,
  if nothing is attached yet, opens the session in Terminal.app via
  AppleScript (the one mechanism confirmed to work) rather than just
  hoping the configured app (`cmux Nightly`) happens to be showing it.
  Once that first window is open, later presses correctly just bring the
  configured app forward — but if you want cmux specifically to be the
  one showing a session's first press, you need to already have a cmux
  surface attached to it beforehand (see below).
- **cmux integration is tmux-only, and has no reliable "attach for me"
  mechanism.** This setup relies on cmux hosting a tmux session (`cmux
  surface resume --kind tmux`), cmux's own documented pattern for
  persistent sessions — not its separate Unix-socket API (workspace
  creation, direct pane input, screen reading), whose CLI syntax isn't
  published anywhere this research could reach (cmux's README defers to
  `cmux.com/docs/api`). Practical result: to have cmux (rather than
  Terminal.app) show a `cowork`/`code` session's output, manually create a
  cmux surface running `tmux attach -t cowork` (and `code`) once ahead of
  time — after that, `tmux list-clients` sees it as attached and the
  script correctly just raises cmux instead of opening Terminal.

## 7a. Alternative: hand-authoring the profile directly

The "Claude Desktop" profile referenced throughout this doc was actually
built by writing its `.sdProfile` JSON directly to disk rather than
dragging actions in the GUI — see
[profile-authoring-reference.md](profile-authoring-reference.md) for the
full reverse-engineered schema, gotchas (the `Current`/`Default` page
duplication warning), and the build → restart → verify loop. That's an
unofficial, undocumented method; §7 below is still the officially
supported path once a profile (however it was built) needs to ship with
the plugin long-term.

## 7. Bundling the built profile with the plugin

Per Elgato's [Profiles guide](https://docs.elgato.com/streamdeck/sdk/guides/profiles),
a Profile isn't just a one-off you build and leave in the Stream Deck app —
you can export it and ship it *with the plugin*, so it's git-tracked and
auto-installs for anyone who installs the plugin, the same way the icons
and scripts already do.

**Steps, once the "Claude Desktop" profile (§3) looks right:**

1. In the Stream Deck app: Preferences → Profiles → export **"Claude
   Desktop"** as a `.streamDeckProfile` file.
2. Drop that file into `com.angelcantugr.devworkflow.sdPlugin/` (alongside
   `manifest.json`).
3. Register it in `manifest.json`'s `Profiles` array — the entry `Name` is
   the path to the file *relative to the manifest, without the extension*:
   ```json
   "Profiles": [
       {
           "Name": "Claude Desktop",
           "DeviceType": 0,
           "Readonly": false,
           "DontAutoSwitchWhenInstalled": false,
           "AutoInstall": true
       }
   ]
   ```
   `AutoInstall: true` means it's offered for install automatically rather
   than waiting for the plugin to first try switching to it.
4. Rebuild (`npm run build`) and reinstall the plugin to pick up the new
   bundled profile.

**Runtime switching.** The SDK also exposes
`streamDeck.profiles.switchToProfile(deviceId, "Claude Desktop")` for
switching to a bundled profile from an action's code (e.g. a future
"jump to Claude Desktop" button) — but this only works for profiles
*bundled with the plugin*. Per the same guide, a plugin can never read,
write, or switch to a user's own arbitrary profiles. That's why the
"Terminal" auto-switch profile (§5) — which isn't a profile this plugin
ships, just one you build for yourself — has to stay a manual, local
Stream Deck setup; there's no bundling or switch-to-profile path for it
from this plugin's code.

**Unconfirmed:** whether a profile's Auto-Switch setting (§5) survives
export/reimport the same way its key layout does — the fetched guide
didn't cover that explicitly. Worth checking after exporting once, rather
than assuming.
