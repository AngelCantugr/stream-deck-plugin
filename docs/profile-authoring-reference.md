# Hand-Authoring Stream Deck Profiles

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

- `Actions` is a map keyed by **`"row,col"`**, zero-indexed (confirmed
  `"0,0"`, `"0,1"`, etc. — an XL is 4 rows × 8 columns).
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

## 6. Build → restart → verify loop

1. Write the bundle to a **brand-new** UUID directory under `ProfilesV3`
   — never edit an existing profile's files directly.
2. Quit and relaunch the Stream Deck app (`osascript -e 'tell application
   "Elgato Stream Deck" to quit'` — if that returns a "user canceled"
   AppleScript error, fall back to `killall "Stream Deck"`; then
   `open -a "Elgato Stream Deck"`). This is disruptive — it reloads every
   plugin process — so get the user's go-ahead first rather than doing it
   unprompted.
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
- **Whether Auto-Switch (per-app) settings live in this same schema is
  still unverified** — none of the profiles inspected while building this
  had Auto-Switch configured, so that piece of the schema is unknown.
- Prefer the officially supported path — build once in the GUI, export as
  `.streamDeckProfile`, bundle via `manifest.json`'s `Profiles` array (see
  [claude-desktop-profile.md §7](claude-desktop-profile.md#7-bundling-the-built-profile-with-the-plugin))
  — for anything meant to ship with the plugin long-term. Use this
  hand-authoring method only when scripting the initial layout is worth
  the risk of an undocumented format.
