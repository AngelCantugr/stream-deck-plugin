# Stream Deck Native Primitives Reference

Stream Deck's own built-in "system" actions — Folders, Multi Actions, Open,
Delay, Text, Hotkey, Pages, Switch Profile. These don't come from any
plugin's `manifest.json` (see
[installed-plugins-actions.md](installed-plugins-actions.md) for
third-party plugin actions) — they only appear inside `.sdProfile` key
layouts, which is where this catalog was extracted from: a survey of every
profile in `~/Library/Application Support/com.elgato.StreamDeck/ProfilesV3/`
(Tmux, Main Hub, Quick Actions, AI Learning, Neovim, Productivity, Claude
Desktop, VS Code, Tick Tick, Obsidian Management — 10 profiles, ~40 pages,
~318 keys total).

See [profile-authoring-reference.md](profile-authoring-reference.md) for
the surrounding `.sdProfile`/page JSON structure these actions sit inside
(the `"col,row"` key grid, `States[]`, etc.) — this doc only covers the
action entries themselves.

---

## Why this matters for this plugin

Two design decisions in this repo came directly from what's cataloged
here:

- The Claude Desktop profile's Cowork/Code skill buttons are built as
  **Multi Actions** (`Open` → `Delay` → `Text`), not as this plugin's own
  Script Runner action — see §2 below and
  [claude-desktop-profile.md](claude-desktop-profile.md). A shell script
  driving `tmux send-keys` + `open -a` turned out to be measurably less
  reliable (~25% success launching a fresh terminal window) than these
  three native primitives, which are the same building blocks the user's
  own pre-existing "AI Learning" profile already used successfully.
- `com.elgato.streamdeck.page.goto/next/previous` (§3) is a lighter-weight
  alternative to Folders for flat multi-page layouts — and it is what the
  Claude Desktop profile actually uses for Chat/Cowork/Code. Folders were
  tried first and rejected because they don't compose with Multi Actions
  (see §2).

---

## 1. Structural primitives (paging/navigation)

### Folder — `com.elgato.streamdeck.profile.openchild`

A key that opens a **child page within the same `.sdProfile` bundle**.
`Settings.ProfileUUID` is the child page's UUID (a `Profiles/<uuid>/`
folder in the same bundle — *not* a separate `.sdProfile`, despite the
field name).

```json
{
  "Name": "Create Folder",
  "Plugin": {"Name": "Create Folder", "UUID": "com.elgato.streamdeck.profile.openchild", "Version": "1.0"},
  "Settings": {"ProfileUUID": "a146d890-cf0a-4209-966c-9d9273f88b31"},
  "States": [{"Title": "Debug \nSession"}],
  "UUID": "com.elgato.streamdeck.profile.openchild"
}
```

### Back button — `com.elgato.streamdeck.profile.backtoparent`

Auto-placed inside a folder page to navigate back up. No settings.

```json
{
  "Name": "Parent Folder",
  "Plugin": {"Name": "Open Parent Folder", "UUID": "com.elgato.streamdeck.profile.backtoparent", "Version": "1.0"},
  "Settings": {},
  "UUID": "com.elgato.streamdeck.profile.backtoparent"
}
```

### Switch Profile — `com.elgato.streamdeck.profile.rotate`

Switches to a **different Profile** entirely (not a page within the same
one). `Settings.ProfileUUID` is the target profile's top-level UUID (the
`.sdProfile` folder name), `PageIndex` picks which page of it to land on,
`DeviceUUID` is usually left `""` (current device).

```json
{
  "Name": "Switch Profile",
  "Plugin": {"Name": "Switch Profile", "UUID": "com.elgato.streamdeck.profile.rotate", "Version": "1.0"},
  "Settings": {"DeviceUUID": "", "PageIndex": 1, "ProfileUUID": "25a91138-eff3-4f69-84f6-a92ccac25733"},
  "States": [{"Title": "Hub"}],
  "UUID": "com.elgato.streamdeck.profile.rotate"
}
```

Note the asymmetry with Folders: Folder/Back navigate *within* one
`.sdProfile`'s page tree; Switch Profile jumps *between* separate
`.sdProfile` bundles. Confirms what
[claude-desktop-profile.md §7](claude-desktop-profile.md) already
established from the SDK docs: `streamDeck.profiles.switchToProfile()` can
only target profiles bundled with a *plugin*, but this native action can
target *any* installed profile — a capability gap between what a plugin's
code can do and what the Stream Deck app itself can do natively.

### Pages — `com.elgato.streamdeck.page.{goto,next,previous}`

A **lighter-weight alternative to Folders**: multiple pages on the *same*
profile level (siblings, not parent/child), navigated with dedicated
Next/Previous/Go-to-index keys instead of a Folder+Back pair. Used
throughout the "Neovim" profile (6 sibling pages) instead of nesting.

```json
{"Name": "Go to Page", "Plugin": {"UUID": "com.elgato.streamdeck.page.goto"}, "Settings": {"PageIndex": 2}}
{"Name": "Next Page",  "Plugin": {"UUID": "com.elgato.streamdeck.page.next"},  "Settings": {}}
{"Name": "Previous Page", "Plugin": {"UUID": "com.elgato.streamdeck.page.previous"}, "Settings": {}}
```

Worth considering for a future flatter layout — no back-button key
overhead, and `goto` allows direct jumps instead of linear next/previous.

**`PageIndex` is 1-indexed**, and maps directly onto position in the
top-level `manifest.json`'s `Pages.Pages` array (`PageIndex: N` → 
`Pages.Pages[N-1]`) — confirmed by cross-checking the Neovim profile's 5
pages: every sub-page's "back to main" button uses `PageIndex: 1`
(`Pages.Pages[0]`), and the main page's 4 forward-nav buttons use
`PageIndex: 2..5` matching `Pages.Pages[1..4]` in order, with zero
exceptions across 8 examples.

---

## 2. Multi Action — `com.elgato.streamdeck.multiactions`

A key whose single press runs an ordered **sequence** of other actions.
Top-level shape: two state slots (`Actions[0]` = short-press sequence,
`Actions[1]` = long-press sequence, usually `{"Actions": []}` if unused).

```json
{
  "Actions": [
    {"Actions": [ /* step 1, step 2, step 3, ... */ ]},
    {"Actions": []}
  ],
  "Name": "Multi Action",
  "Plugin": {"Name": "Multi Action", "UUID": "com.elgato.streamdeck.multiactions", "Version": "1.0"},
  "Settings": {},
  "States": [{"Title": "Concept\nMap", "ShowTitle": true, "TitleAlignment": "bottom", "TitleColor": "#ffffff", ...}],
  "UUID": "com.elgato.streamdeck.multiactions.routine"
}
```

Each step inside the inner `Actions[]` array is a **regular action
entry** (same shape as any standalone key) — any action from this catalog
or a third-party plugin can be a step. The `Delay` step is itself part of
the Multi Action plugin family:

```json
{
  "Name": "Delay",
  "Plugin": {"Name": "Multi Action", "UUID": "com.elgato.streamdeck.multiactions", "Version": "1.0"},
  "Settings": {"delay": 1000},
  "UUID": "com.elgato.streamdeck.multiactions.delay"
}
```

**The pattern this repo now relies on** — `Open` → `Delay(1000ms)` →
`Text` — launches/focuses an app, waits for it to settle, then types a
command into whatever's now focused. See §4/§5 for those two steps'
schemas, and
[claude-desktop-profile.md](claude-desktop-profile.md) for why this
replaced a shell-script-based approach.

**Folder-open as a Multi Action step — confirmed NOT working.** No
existing profile on this machine had ever nested a
`com.elgato.streamdeck.profile.openchild` (§1) action inside a Multi
Action, so this was untested territory — built it (Folder-open → Hotkey
Cmd+1/2/3) and it did not work in practice. Superseded by the Pages-based
pattern below; Folders and Multi Actions don't compose, at least not this
combination. Worth remembering before trying it again.

**Hotkey + Go-to-Page as a Multi Action step — confirmed working.** The
actual solution: replace Folders entirely with sibling **Pages** (§1) on
the same profile, and use a Multi Action of `Hotkey` → `Go to Page` for
each top-level nav key. This switches Claude Desktop's active tab *and*
navigates the Stream Deck to the matching page from one press — same
goal as the failed Folder approach, different (working) mechanism. See
[claude-desktop-profile.md §2](claude-desktop-profile.md) for the full
layout this produced.

---

## 3. Open — `com.elgato.streamdeck.system.open`

Opens an app or file by path. `Settings.path` is the path **as a quoted
string within the JSON string value** (note the literal escaped quotes —
this is how the Stream Deck app itself serializes it, not a mistake to
clean up):

```json
{
  "Name": "Open",
  "Plugin": {"Name": "Open", "UUID": "com.elgato.streamdeck.system.open", "Version": "1.0"},
  "Settings": {"path": "\"/Applications/Visual Studio Code.app\""},
  "States": [{"Title": "Visual\nStudio"}],
  "UUID": "com.elgato.streamdeck.system.open"
}
```

Brings the app's most-recently-focused window forward — it does **not**
create a new window or attach to anything specific. (This is the exact
gap that made a bare `open -a` insufficient for reliably showing a
particular tmux session — see
[claude-desktop-profile.md §6](claude-desktop-profile.md).)

---

## 4. Text — `com.elgato.streamdeck.system.text`

Types literal text (optionally + Enter) into whatever currently has
keyboard focus — a native alternative to `osascript keystroke` or
`tmux send-keys`.

```json
{
  "Name": "Text",
  "Plugin": {"Name": "Text", "UUID": "com.elgato.streamdeck.system.text", "Version": "1.0"},
  "Settings": {
    "Hotkey": {"KeyModifiers": 0, "QTKeyCode": 33554431, "VKeyCode": -1},
    "isSendingEnter": true,
    "isTypingMode": false,
    "pastedText": "/mode concept-map"
  },
  "UUID": "com.elgato.streamdeck.system.text"
}
```

`isTypingMode: false` means it's pasted as one block rather than
character-by-character simulated keystrokes; `isSendingEnter: true`
appends a Return press. The `Hotkey` sub-object is present but unused
(`VKeyCode: -1`) in every example seen — likely an alternate trigger-key
binding feature not exercised by any of these profiles.

**Caveat inherited from this catalog's own use in this repo:** `Text`
types into *whatever is focused* — it has no awareness of which window
that is. The Multi Action's `Open` step must reliably bring the *correct*
window forward before `Text` fires, which is why this depends on a
persistent window already being attached to the right context (see
[claude-desktop-profile.md](claude-desktop-profile.md)'s note on that
assumption).

---

## 5. Hotkey — `com.elgato.streamdeck.system.hotkey`

Sends a keyboard shortcut. `Hotkeys` is a fixed 4-element array; unused
slots are all-`-1`/all-`false`. `Coalesce: true` seen in every example —
purpose not confirmed from usage alone (likely: merge rapid repeated
presses into one event; not verified against SDK docs).

**The 4 slots are NOT confirmed to be a sequential chord.** Originally
assumed this might let one Hotkey action send a multi-key sequence (e.g.
Cmd+Shift+M, then a bare number key) in slots 1/2. Searched every profile
on this machine for an example using more than one non-blank slot: zero
found. Rather than gamble on unconfirmed schema (see the Folder +
Multi-Action failure in §2), built an actual 2-key chord (Claude Code's
Cmd+Shift+M → number permission-mode switch) as **two separate Hotkey
steps inside one Multi Action, with a Delay between them** — reusing the
`Hotkey → Delay → Text` sequencing already confirmed working in the
pre-existing "AI Learning" profile, just swapping the final `Text` step
for a second `Hotkey`. See
[claude-desktop-profile.md](claude-desktop-profile.md) for the built
example. What the 4 `Hotkeys` slots are actually for remains unconfirmed.

**Confirmed `KeyModifiers` bitmask** (cross-checked against 15+ real
examples across multiple profiles, zero contradictions): `Shift = 1`,
`Ctrl = 2`, `Option = 4`, `Cmd = 8` — combined by addition (e.g.
Cmd+Shift = 9, Cmd+Option = 12, Ctrl+Option = 6).

```json
{
  "Name": "Hotkey",
  "Plugin": {"Name": "Activate a Key Command", "UUID": "com.elgato.streamdeck.system.hotkey", "Version": "1.0"},
  "Settings": {
    "Coalesce": true,
    "Hotkeys": [
      {"KeyCmd": true, "KeyCtrl": false, "KeyOption": false, "KeyShift": false, "KeyModifiers": 8, "NativeCode": 34, "QTKeyCode": 73, "VKeyCode": 34},
      {"KeyCmd": false, "KeyCtrl": false, "KeyOption": false, "KeyShift": false, "KeyModifiers": 0, "NativeCode": -1, "QTKeyCode": 33554431, "VKeyCode": -1},
      {"KeyCmd": false, "KeyCtrl": false, "KeyOption": false, "KeyShift": false, "KeyModifiers": 0, "NativeCode": -1, "QTKeyCode": 33554431, "VKeyCode": -1},
      {"KeyCmd": false, "KeyCtrl": false, "KeyOption": false, "KeyShift": false, "KeyModifiers": 0, "NativeCode": -1, "QTKeyCode": 33554431, "VKeyCode": -1}
    ]
  },
  "States": [{"Title": "⌘ C"}],
  "UUID": "com.elgato.streamdeck.system.hotkey"
}
```

This is what [claude-desktop-profile.md §4](claude-desktop-profile.md)
already recommends (manually, via the GUI) for Claude Desktop's Code-tab
shortcuts — this schema is what that manual step produces on disk, useful
if hand-authoring more of them becomes worthwhile.

**Keycode formula — confirmed.** `NativeCode` and `VKeyCode` are macOS's
Carbon `kVK_ANSI_*` virtual keycodes; `QTKeyCode` is Qt's `Qt::Key_*` enum
(equal to the ASCII code for letters/digits). Cross-checked against 7+
existing Hotkey entries in local profiles with zero mismatches (even
caught a data-entry bug in the "Neovim" profile, where three
differently-titled keys — "Bold", "Recent Files", "Preview" — all
silently share the identical Cmd+E encoding). Then used to hand-author
Cmd+1/2/3 (`NativeCode`/`VKeyCode` 18/19/20, `QTKeyCode` 49/50/51) for the
Claude Desktop profile's folder keys (§2) — confirmed working by direct
testing, not just formula cross-checking.

---

## 6. Timer — `com.elgato.streamdeck.system.timer`

Runs a bundled `.sdTimer` routine file on a schedule/duration.

```json
{
  "Name": "Timer",
  "Plugin": {"Name": "Timer", "UUID": "com.elgato.streamdeck.system.timer", "Version": "1.0"},
  "Settings": {"actionIdx": 0, "duration": "...", "lastUserFile": "..."},
  "UUID": "com.elgato.streamdeck.system.timer"
}
```

Not investigated further — no current use case in this plugin, noted for
completeness only.

---

## 7. Third-party alternatives worth knowing about

Already cataloged in
[installed-plugins-actions.md](installed-plugins-actions.md), but two are
directly relevant to this plugin's own action design as points of
comparison:

- **Mac Automation's Run Shell Command** (`com.thoughtasylum.macauto.runshell`)
  — `Settings: {"shellCommand": "<command>"}`. Simpler than this plugin's
  own Script Runner (no `configId` indirection through
  `dev-workflow.config.ts`, no scripts-directory convention) — a native
  plugin's shell action can be a literal inline string per key. Trade-off:
  no git-tracked, typed config; the command lives only inside the
  `.sdProfile` binary blob.
- **PythonScriptDeck's Run Script**
  (`com.nicoohagedorn.pythonscriptdeck.script`) — present in several
  profiles but no example key had a populated `Settings` block captured
  in this survey (likely configured via a file picker the JSON doesn't
  fully surface, or the specific keys checked were unconfigured
  placeholders).

---

*Extracted 2026-07-07 by surveying all profiles under
`~/Library/Application Support/com.elgato.StreamDeck/ProfilesV3/` — see
[profile-authoring-reference.md](profile-authoring-reference.md) for the
extraction methodology.*
