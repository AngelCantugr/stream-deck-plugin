# Claude Desktop Stream Deck Profile

A profile for Claude Desktop with a main page plus 3 sibling **Pages** —
Chat, Cowork, Code — plus a second profile that auto-switches in whenever
a terminal app is frontmost.

**Pages, not Folders — Folders don't compose with Multi Actions.** The
original design nested Chat/Cowork/Code as Folders (parent/child pages via
`openchild`/`backtoparent`), with each top-level key a Multi Action doing
Folder-open + Hotkey (Cmd+1/2/3) to switch Claude Desktop's own tab at the
same time. Built and tested: **that combination does not work.** The
working replacement uses flat sibling **Pages** (`page.goto`) instead of
Folders — see §2 and
[native-primitives-reference.md §2](native-primitives-reference.md) for
what was actually confirmed vs. what wasn't.

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

- **"Claude Desktop"** — 4 sibling Pages (main + Chat / Cowork / Code) for
  paging while Claude Desktop itself is the app you're driving from.
- **"Terminal"** — a flat grid of the same Cowork/Code skill buttons, set to
  auto-switch in whenever Terminal, iTerm, or cmux is frontmost.

Both profiles use the *same* `skill-*` Script Runner buttons. Each button's
underlying script (`send-skill-to-session.sh`) is session-aware: if the
target tmux session already has `claude` running interactively, it types the
skill straight into that live REPL; otherwise it starts `claude` fresh with
the skill as its argument. So pressing "New PR" behaves identically whether
you're paging through Claude Desktop's Code folder or sitting in a terminal
that auto-switched the Stream Deck to the Terminal profile.

## 2. Page → key map (Claude Desktop profile)

**As actually built** (superseding the original Folder / App Launcher /
Script Runner design in the collapsed section below — kept as a record of
the `configId` pattern this plugin still uses for buttons *outside* this
profile):

`Pages.Pages` in the top-level manifest is `[main, Chat, Cowork, Code]` —
`page.goto` `PageIndex` is 1-indexed, so main=1, Chat=2, Cowork=3, Code=4
(see [native-primitives-reference.md §1](native-primitives-reference.md)).

### Main page (page 1)

| Key | Type | Steps |
|---|---|---|
| Chat | Multi Action | Hotkey Cmd+1 → Go to Page 2 |
| Cowork | Multi Action | Hotkey Cmd+2 → Go to Page 3 |
| Code | Multi Action | Hotkey Cmd+3 → Go to Page 4 |

Confirmed working: switching Claude Desktop's own active tab *and*
navigating the Stream Deck to the matching page from one key press.

### Chat page (page 2)

| Key | Action | Target | Notes |
|---|---|---|---|
| 0,0 | Go to Page 1 | — | Back to main page. |
| 0,1 | Open (native) | `/Applications/Claude.app` | Opens/focuses the Claude app. |

Intentionally thin — Claude Desktop has no documented Chat-tab shortcuts,
URL scheme, or CLI flag to jump into Chat specifically, so there's nothing
else to script here yet.

### Cowork page (page 3)

Key positions are `"col,row"` (col 0–7, row 0–3) — see
[profile-authoring-reference.md §3](profile-authoring-reference.md) for
why that's called out explicitly (a real bug came from assuming the
opposite order).

| Key | Action | configId | Skill |
|---|---|---|---|
| 0,0 | Go to Page 1 | — | Back to main page. |
| 0,1 | Open (native) | — | `/Applications/Claude.app` |
| 0,2 | cmux Workflow | `skill-team-status` | `/dev-team:team-status` |
| 0,3 | cmux Workflow | `skill-po-status` | `/product-ownership:status` |
| 1,0 | cmux Workflow | `skill-gh-status` | `/github-project-management:status` |
| 1,1 | cmux Workflow | `skill-gh-daily` | `/github-project-management:daily-status` |

Rebuilt from the original Multi Action (`Open cmux` → `Delay` → `Text`)
pattern to the `cmux Workflow` action — see §6 and
[cmux-integration-reference.md](cmux-integration-reference.md).

### Code page (page 4)

| Key | Action | configId / Target | Skill |
|---|---|---|---|
| 0,0 | Go to Page 1 | — | Back to main page. |
| 0,1 | Open (native) | — | `/Applications/Claude.app` |
| 0,2 | cmux Workflow | `skill-create-pr` | `/pr-workflow:create-pr` |
| 0,3 | cmux Workflow | `skill-commit-pr-mon` | `/pr-workflow:commit-push-pr-monitor` |
| 1,0 | cmux Workflow | `skill-devbasic-stat` | `/dev-basic:status` |
| 1,1 | cmux Workflow | `skill-devbasic-cfg` | `/dev-basic:configure` |
| 1,2 | Multi Action | Hotkey ⌘⇧M → Delay → Hotkey 1 | Permission mode: Manual |
| 1,3 | Multi Action | Hotkey ⌘⇧M → Delay → Hotkey 2 | Permission mode: Accept Edits |
| 2,1 | cmux Workflow | `skill-clean-audit` | `/clean-code:audit` |
| 2,2 | cmux Workflow | `skill-watch-issues` | `/engineering-core:watch-issues` |
| 2,3 | Multi Action | Hotkey ⌘⇧M → Delay → Hotkey 3 | Permission mode: Plan Mode |
| 3,0 | Multi Action | Hotkey ⌘⇧M → Delay → Hotkey 4 | Permission mode: Auto Mode |
| 3,1 | Multi Action | Hotkey ⌘⇧M → Delay → Hotkey 5 | Permission mode: Bypass Permissions |
| 3,2 | Multi Action | Hotkey ⌘⇧I → Delay → Hotkey 1 | Model: Fable 5 |
| 3,3 | Multi Action | Hotkey ⌘⇧I → Delay → Hotkey 2 | Model: Opus 4.8 |
| 4,0 | Multi Action | Hotkey ⌘⇧I → Delay → Hotkey 3 | Model: Sonnet 5 |
| 4,1 | Multi Action | Hotkey ⌘⇧I → Delay → Hotkey 4 | Model: Haiku 4.5 |

(`2,0` is occupied by a manual test key the user added to confirm the
`col,row` convention — a duplicate "Plan Mode" title; harmless, safe to
delete or repurpose.)

Same chord pattern for model switching: Cmd+Shift+I opens the model
menu, then a bare number (1–4) picks one. Built the same way as the
permission-mode switch — `Hotkey → Delay → Hotkey` inside one Multi
Action, not the unconfirmed 4-slot chord array.

Claude Code's permission-mode menu is a **chord**: Cmd+Shift+M opens the
menu, then a bare number key (1–5) picks a mode. The Hotkey action's
`Settings.Hotkeys` array has 4 slots and *looks* like it might support a
multi-key chord in one action — but no existing profile on this machine
ever used more than one non-blank slot, so that was unconfirmed, exactly
like the Folder+Multi-Action trap above. Built the safer way instead:
two separate `Hotkey` steps (Cmd+Shift+M, then the number) inside one
Multi Action with a `Delay` between them — the same sequencing pattern
already confirmed working in the pre-existing "AI Learning" profile
(`Hotkey → Delay → Text`). See
[native-primitives-reference.md §5](native-primitives-reference.md) for
the confirmed `KeyModifiers` bitmask this was built from.

**A first version of these positions used `"row,col"` order** (e.g.
`"0,4"`, `"1,6"`) — silently invalid, since the second number is actually
the row and an XL only has 4 (0–3). Those keys never rendered anywhere,
with no error in the log. Caught by the user reporting only 2 of 5 new
buttons visible; confirmed root cause by having them add one key "in the
next column" and observing it land at `"2,0"` — the number that moved
was the *first* one. All positions above reflect the corrected layout.

Plus native Hotkey buttons — see §4.

<details>
<summary>Original design (App Launcher / Script Runner configIds) — superseded first by the Multi Action pattern above, and since by the cmux Workflow action below</summary>

| Action | configId | Notes/Skill |
|---|---|---|
| App Launcher | `claude-desktop` | Opens/focuses the Claude app. |
| Script Runner | `skill-team-status` | `/dev-team:team-status` |
| Script Runner | `skill-po-status` | `/product-ownership:status` |
| Script Runner | `skill-gh-status` | `/github-project-management:status` |
| Script Runner | `skill-gh-daily` | `/github-project-management:daily-status` |
| Script Runner | `skill-create-pr` | `/pr-workflow:create-pr` |
| Script Runner | `skill-commit-pr-mon` | `/pr-workflow:commit-push-pr-monitor` |
| Script Runner | `skill-clean-audit` | `/clean-code:audit` |
| Script Runner | `skill-watch-issues` | `/engineering-core:watch-issues` |
| Script Runner | `skill-devbasic-stat` | `/dev-basic:status` |
| Script Runner | `skill-devbasic-cfg` | `/dev-basic:configure` |

**These Script Runner `configId`s and the `send-skill-to-session.sh` script
they ran no longer exist** — replaced by the `cmux Workflow` action
(`com.angelcantugr.devworkflow.cmux-workflow`) and equivalent `configId`s
in `CMUX_WORKFLOWS` (same ids, e.g. `skill-team-status`,
`skill-create-pr`), which dispatch directly over the cmux CLI/socket
instead of tmux + AppleScript. See
[cmux-integration-reference.md](cmux-integration-reference.md).

</details>

## 3. Manual assembly steps

1. In the Stream Deck app, create a new Profile named **"Claude Desktop"**.
2. Add 3 more Pages to it (not Folders) — the main page plus Chat, Cowork,
   Code, in that order, so `page.goto PageIndex` 1/2/3/4 line up.
3. On the main page, add 3 Multi Action keys (Chat/Cowork/Code), each with
   a Hotkey step (Cmd+1/2/3) followed by a Go to Page step (2/3/4). On
   each of the other 3 pages, add a Go to Page 1 key for going back, then
   drag in the rest of the actions from the tables in §2.
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

- **Chat page is thin.** No Chat-tab automation surface is documented
  anywhere for Claude Desktop — revisit if that changes.
- **Folders don't compose with Multi Actions.** Confirmed by real testing
  (not just absence of precedent): a Multi Action step of Folder-open →
  Hotkey does not work. This is why the profile uses flat sibling Pages
  instead of Folders — see
  [native-primitives-reference.md §2](native-primitives-reference.md).
- **No custom icons yet — deliberately deferred, not a limitation.** Every
  button on this profile now uses a native primitive (Open, Multi Action,
  Hotkey) instead of this plugin's own icon-bearing action types, so keys
  currently render with Stream Deck's generic default icon per action
  type rather than something distinct per skill/mode/model. This is fine
  for now, but the door is open to add them later: any key's
  `States[].Image` accepts a path to a PNG copied into that page's own
  `Images/` folder — exactly the mechanism already used for the Chat/
  Cowork/Code App Launcher buttons in the very first version of this
  profile (see
  [profile-authoring-reference.md §4](profile-authoring-reference.md)).
  Nothing about the native-primitive design blocks this — it just hasn't
  been done.
- **Resolved — tmux/AppleScript mechanism replaced.** All four caveats
  originally documented here (unverified REPL-detection heuristic, no
  locking against double-presses, first-press-opens-Terminal-not-cmux, and
  cmux's socket API being unpublished/unresearched) applied to
  `send-skill-to-session.sh`, which has been deleted. Skill dispatch now
  goes through cmux's own CLI/socket directly (`cmux new-workspace` /
  `select-workspace` / `send`) via the `cmux Workflow` action — no tmux,
  no REPL-sniffing, no AppleScript, and no Terminal.app fallback, since
  `cmux new-workspace --focus true` puts the workspace in front natively.
  Full detail, including the one caveat that does still apply (no locking
  against two very-fast presses racing `find-or-create`), is in
  [cmux-integration-reference.md](cmux-integration-reference.md).
- **The bundled "Claude Desktop" profile has been rebuilt.** All 10 skill
  buttons (§2's Cowork/Code tables) now use the `cmux Workflow` action
  instead of the native Multi Action (`Open cmux` → `Delay` → `Text`)
  pattern — hand-edited directly in the live `.sdProfile` bundle (same
  method as §7a), then re-zipped into this repo's bundled
  `Claude Desktop.streamDeckProfile`. `streamdeck validate` passes and the
  Stream Deck app log shows a clean restart with no schema warnings for
  this profile. **Not yet confirmed on the physical device** — that needs
  a human to look at the Stream Deck and press a key.

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

**Official steps (Elgato's documented path), once the "Claude Desktop"
profile (§3) looks right:**

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

**What was actually done: reverse-engineered Step 1, skipping the GUI
export entirely.** `.streamDeckPlugin` files (produced by `streamdeck
pack`) are confirmed to just be ZIP archives — checked with `file` on a
freshly-packed one (`Zip archive data`, `PK\x03\x04` magic bytes).
`.streamDeckProfile` is the sibling format for profiles, so the same
theory was tested: `zip -r -X "Claude Desktop.streamDeckProfile"
manifest.json Images Profiles` run from inside the hand-authored
`.sdProfile` bundle directory (`9E5A675D-....sdProfile`, itself built per
[profile-authoring-reference.md](profile-authoring-reference.md)),
dropped straight into `com.angelcantugr.devworkflow.sdPlugin/`. `streamdeck
validate` passed cleanly against the resulting manifest + bundled profile.
No `.streamDeckProfile` file from an actual GUI export was available on
this machine to diff against, so the *exact* byte-for-byte format Elgato's
own exporter produces is still unconfirmed — `streamdeck validate` passing
is a real but partial signal, not full confirmation the app will install
this file the same way a GUI export would. If it doesn't behave correctly
on a fresh plugin install, exporting once via the GUI and diffing against
this file is the fallback.

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
