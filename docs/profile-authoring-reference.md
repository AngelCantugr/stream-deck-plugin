# Hand-Authoring Stream Deck Profiles

> **2026-07-14 — this schema is now encoded in a generator.** Everything
> below is automated by `src/profiles/` (`npm run profiles`); write a
> `ProfileSpec` in `src/profiles/definitions/` instead of hand-writing
> JSON. Two additional facts learned while building it:
> **(1) UUID case matters** — the app serializes UUIDs lowercase inside
> manifest JSON and uppercase in directory names; follow that convention.
> **(2) Auto-switch can't be verified from a background shell** —
> `osascript`/`open` activations don't produce real focus changes, so a
> generated profile's `AppIdentifier` behavior needs a human (or true
> foreground activation) to confirm. Drop-in registration itself works:
> new bundles written while the app is quit appear in the profile list on
> next launch, no GUI import needed (re-confirmed on app 7.5.0).

An undocumented but working method for creating a Stream Deck Profile
(pages, folders, and keys) directly as files on disk, instead of only via
drag-and-drop in the Stream Deck app. This is how the actual "Claude
Desktop" profile in this repo was built — see
[claude-desktop-profile.md](claude-desktop-profile.md) for that profile's
specific layout, and §7 there for the *officially supported* build →
export → bundle-via-manifest workflow. This doc is the alternative,
unofficial path: skip building in the GUI entirely and write the profile's
JSON straight to disk.

**This is reverse-engineered, not documented by Elgato.** Nothing here is
guaranteed to keep working across Stream Deck app updates. Treat it as a
last-resort tool, not a replacement for the GUI or the supported
export/bundle flow in §7 of the Claude Desktop doc.

---

## 1. Where profiles live

```
~/Library/Application Support/com.elgato.StreamDeck/ProfilesV3/<PROFILE-UUID>.sdProfile/
├── manifest.json                              ← top-level: name, device, page list
├── Images/                                     ← unused at the top level in practice
└── Profiles/
    └── <PAGE-UUID>/
        ├── manifest.json                       ← one page's key layout
        └── Images/                              ← per-key icon snapshots for this page
```

Confirmed from the running app's own log
(`~/Library/Logs/ElgatoStreamDeck/StreamDeck.log`) at startup:

```
Using existing ProfilesV3
Using existing profiles directory: '.../ProfilesV3'
```

**This means Stream Deck scans the whole `ProfilesV3` directory at
startup** — a hand-written bundle just needs to exist there before the app
launches; no explicit "import" or registration step is required. There is
no separate profile database/index (checked `Data/application_cache.json`
— it only holds notification state). But there's no evidence the app
*live*-watches the directory either (confirmed via `lsof` showing no open
handle on it while running) — **a restart is needed** to pick up a new or
changed profile bundle.

## 2. Top-level `manifest.json`

```json
{
    "AppIdentifier": "/Applications/Claude.app",
    "Device": { "Model": "20GAT9901", "UUID": "@(1)[4057/108/CL37L2A00421]" },
    "Name": "Claude Desktop",
    "Pages": {
        "Current": "<uuid-of-the-real-populated-page>",
        "Default": "<uuid-of-a-separate-EMPTY-page>",
        "Pages": ["<uuid-of-the-real-populated-page>"]
    },
    "Version": "3.0"
}
```

- `AppIdentifier` (optional) — the profile's Auto-Switch app association:
  when this app becomes frontmost, Stream Deck switches to this profile
  automatically. Confirmed by inspecting the "Tick Tick" profile
  (`"AppIdentifier": "/Applications/TickTick.app"`). Omit entirely for a
  profile with no auto-switch behavior (most hand-inspected profiles don't
  have this key at all, not even as `null` or `""`).
- `Device` — copy verbatim from an existing profile on the same machine
  (`Model`/`UUID` identify the physical Stream Deck; every profile for the
  same device shares the same value).
- **`Current` and `Default` must be two DIFFERENT page UUIDs.** Pointing
  both at the same page produces this non-fatal but real warning at
  startup:
  ```
  DOM  war  Failed to map default page '<uuid>' for umbrella '<uuid>' (duplicate)
  ```
  `Default` should point at a separate, genuinely empty page (see §3);
  `Pages.Pages` should list only the real populated page(s), not `Default`.
  This mirrors what a real profile built through the GUI looks like on
  disk — confirmed by inspecting an existing profile before writing a new
  one.

## 3. Per-page `manifest.json`

One file per page (main page, and one per folder), at
`Profiles/<PAGE-UUID>/manifest.json`:

```json
{
    "Controllers": [
        {
            "Actions": {
                "0,0": { "...": "an action entry, see §4" },
                "0,1": { "...": "another action entry" }
            },
            "Type": "Keypad"
        }
    ],
    "Icon": "",
    "Name": ""
}
```

- `Actions` is a map keyed by **`"col,row"`**, zero-indexed — an XL is 8
  columns (valid: 0–7) × 4 rows (valid: 0–3). **Not `"row,col"`** — that
  was the original (wrong) assumption in this doc, corrected after a real
  bug: `"0,4"`/`"0,5"`/`"1,4"`..`"1,6"` were written assuming the *second*
  number was a column (so up to 7 was safe) when it's actually the row
  (max 3) — those keys silently fell off the physical device entirely,
  with no error anywhere. Confirmed by watching the Stream Deck app place
  a manually-added key at `"2,0"` after being told to add it "in the next
  column" — the number that incremented for "next column" was the
  *first* one. **When placing multiple keys in a row (same physical row,
  varying column), keep the second number fixed and vary the first** —
  the opposite of what "row,col" would suggest.
- An empty page (used for the `Default` slot in §2) is just
  `{"Controllers": [{"Actions": null, "Type": "Keypad"}], "Icon": "", "Name": ""}`.

## 4. Action entry schema

Every key on a page is an object with this shape:

```json
{
    "ActionID": "<random-uuid-per-key-instance>",
    "LinkedTitle": true,
    "Name": "Script Runner",
    "Plugin": { "Name": "Script Runner", "UUID": "com.angelcantugr.devworkflow.script-runner", "Version": "1.0.0.0" },
    "Resources": null,
    "Settings": { "configId": "skill-team-status" },
    "State": 0,
    "States": [{ "Image": "Images/script-runner-abcd1234.png", "Title": "Team St" }],
    "UUID": "com.angelcantugr.devworkflow.script-runner"
}
```

- `ActionID` — a fresh random UUID per key instance (not the same as the
  action-type UUID); generate one per key, don't reuse.
- `Plugin.UUID` and the top-level `UUID` — both equal this plugin's action
  UUID from `manifest.json` (e.g. `com.angelcantugr.devworkflow.app-launcher`).
- `Settings` — exactly what the action's TypeScript reads via
  `ev.payload.settings` (for this plugin: `{ "configId": "..." }`).
- `States[].Image` — a path *relative to this page's own directory*,
  pointing into that page's `Images/` folder. Copy the actual icon PNG in
  from the plugin's `imgs/actions/<action>/key.png` under a unique
  filename — this is what the GUI does automatically when you drag an
  action onto a key, and matching that behavior avoids relying on
  undocumented image-omission fallback behavior.

## 5. Folders

A Folder is not a distinct "type" — it's a specific system action
(`com.elgato.streamdeck.profile.openchild`) whose settings point at
another page's UUID:

```json
{
    "ActionID": "<random-uuid>",
    "LinkedTitle": true,
    "Name": "Create Folder",
    "Plugin": { "Name": "Create Folder", "UUID": "com.elgato.streamdeck.profile.openchild", "Version": "1.0" },
    "Resources": null,
    "Settings": { "ProfileUUID": "<child-page-uuid>" },
    "State": 0,
    "States": [{ "Title": "Chat" }],
    "UUID": "com.elgato.streamdeck.profile.openchild"
}
```

The child page (`Profiles/<child-page-uuid>/manifest.json`) needs its own
back-navigation key, confirmed at position `"0,0"` in every folder page
inspected:

```json
{
    "ActionID": "<random-uuid>",
    "LinkedTitle": true,
    "Name": "Parent Folder",
    "Plugin": { "Name": "Open Parent Folder", "UUID": "com.elgato.streamdeck.profile.backtoparent", "Version": "1.0" },
    "Resources": null,
    "Settings": {},
    "State": 0,
    "States": [{ "Title": "" }],
    "UUID": "com.elgato.streamdeck.profile.backtoparent"
}
```

(There's also `com.elgato.streamdeck.profile.rotate`, a "Switch Profile"
system action with `Settings: {"DeviceUUID", "PageIndex", "ProfileUUID"}`
— for jumping to an entirely different top-level profile rather than a
folder within the same one. Not used in the Claude Desktop profile, noted
here since it was found in the same reverse-engineering pass.)

## 5a. Pages — the working alternative to Folders for Multi Actions

**Folders don't compose with Multi Actions — confirmed by testing, not
just absence of precedent.** A Multi Action step of Folder-open
(`openchild`) → Hotkey was built and did not work. If a key needs to both
navigate *and* do something else (a hotkey, in the Claude Desktop
profile's case) in one press, use flat sibling **Pages** instead of a
Folder hierarchy.

**The mental model is different from Folders.** A Folder is parent/child:
one page's key opens into another page nested under it, with its own
`ProfileUUID`-addressed relationship and a dedicated back-to-parent
action. Pages are siblings: every page in `Pages.Pages` (§2) is a peer,
addressed by **position in that array**, navigated with `page.goto`
(jump to a specific one), `page.next`/`page.previous` (step through them
in array order) — there's no parent/child concept, so "going back" is
just another `goto` pointed at whichever page you consider "home":

```json
{
    "ActionID": "<random-uuid>",
    "LinkedTitle": true,
    "Name": "Go to Page",
    "Plugin": { "Name": "Pages", "UUID": "com.elgato.streamdeck.page.goto", "Version": "1.0" },
    "Resources": null,
    "Settings": { "PageIndex": 2 },
    "State": 0,
    "States": [{ "Title": "" }],
    "UUID": "com.elgato.streamdeck.page.goto"
}
```

`next`/`previous` have the same shape with an empty `Settings: {}` and
UUIDs `com.elgato.streamdeck.page.next` / `com.elgato.streamdeck.page.previous`.

**`PageIndex` is 1-indexed and maps directly onto `Pages.Pages` array
position:** `PageIndex: N` → `Pages.Pages[N-1]`. Confirmed by
cross-checking an existing 5-page profile ("Neovim") end to end: every
sub-page's "back to main" key uses `PageIndex: 1` (`Pages.Pages[0]`), and
the main page's 4 forward-nav keys use `PageIndex: 2..5` matching
`Pages.Pages[1..4]` in order — 8 examples, zero exceptions.

**To add a page:** create its `Profiles/<PAGE-UUID>/manifest.json` (§3),
then append its UUID to the top-level manifest's `Pages.Pages` array
(§2) — position in that array *is* what `PageIndex` refers to, so order
matters. `Pages.Current`/`Pages.Default` are unaffected by how many
sibling pages exist; they still just mark which page opens first and
which is the separate empty placeholder (§2).

**Combining with Multi Action (the actual point of switching to Pages):**
a `Hotkey` step followed by a `page.goto` step in one Multi Action — this
is what replaced the broken Folder-open + Hotkey combination. See
[claude-desktop-profile.md §2](claude-desktop-profile.md) for the full
worked example (Chat/Cowork/Code as pages 2/3/4, each triggered from page
1 by Cmd+1/2/3 + goto).

## 6. Build → restart → verify loop

1. Write the bundle to a **brand-new** UUID directory under `ProfilesV3`
   — never edit an existing profile's files directly.
2. Quit and relaunch the Stream Deck app:
   ```bash
   osascript -e 'quit app "Elgato Stream Deck"'
   sleep 2
   open -a "Elgato Stream Deck"
   ```
   **The `osascript` call reliably returns a `User canceled (-128)` error
   even when it worked** — confirmed across many restarts this session by
   checking the resulting process's start time (`ps -o pid,lstart,command
   -p $(pgrep -f "Stream Deck.app/Contents/MacOS/Stream Deck")`) after
   each one; it was a fresh PID/timestamp every single time despite the
   "canceled" message. Don't treat that error as a real failure or reach
   for `killall` because of it — verify with the PID/timestamp check
   instead of trusting the AppleScript exit status. This is disruptive —
   it reloads every plugin process — so get the user's go-ahead first
   rather than doing it unprompted.
3. Check `~/Library/Logs/ElgatoStreamDeck/StreamDeck.log` for `war `/`err `
   lines mentioning your profile's UUID or name — this is the fastest way
   to catch a schema mistake (like the `Current`/`Default` duplicate
   above) without needing to look at the app itself.
4. Confirm visually in the app's Profile switcher — this step can't be
   automated from a coding-agent session; it needs the user (or a
   computer-use session actually targeting the same machine, which wasn't
   available when this was built) to look.

## 7. Known limitations

- **Undocumented.** No Elgato reference covers this schema; everything
  above was derived by inspecting real profiles already on this machine
  and reading the app's own log output. It may break on a Stream Deck app
  update.
- **No live directory watch confirmed.** Changes need an app restart to
  take effect (§6).
- **Auto-Switch (per-app) lives in this same schema — confirmed.** Setting
  `"AppIdentifier": "/Applications/Claude.app"` in the top-level
  `manifest.json` (§2) is exactly what the Stream Deck GUI writes, and the
  shipped Claude Desktop profile uses it successfully — see
  [claude-desktop-profile.md §5](claude-desktop-profile.md#5-auto-switch-profile-config).
  Still unknown: how (or whether) *multiple* apps can share one profile's
  Auto-Switch; no multi-app `AppIdentifier` encoding has been found.
- Prefer the officially supported path — build once in the GUI, export as
  `.streamDeckProfile`, bundle via `manifest.json`'s `Profiles` array (see
  [claude-desktop-profile.md §7](claude-desktop-profile.md#7-bundling-the-built-profile-with-the-plugin))
  — for anything meant to ship with the plugin long-term. Use this
  hand-authoring method only when scripting the initial layout is worth
  the risk of an undocumented format.
