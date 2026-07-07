# Stream Deck Plugin — Dev Workflow

## Project Purpose

A personal Stream Deck XL plugin where **all button behaviors are defined in TypeScript source code**. No button configuration via the Stream Deck GUI — edit `src/config/dev-workflow.config.ts`, rebuild, done.

Plugin UUID: `com.angelcantugr.devworkflow`

---

## Prerequisites

```bash
nvm install 24 && nvm use 24
npm install -g @elgato/cli
streamdeck dev        # one-time: enable developer mode
```

## Development Loop

```bash
npm install
streamdeck link com.angelcantugr.devworkflow.sdPlugin   # one-time: link to Stream Deck
npm run watch         # auto-rebuilds + restarts plugin on every src/ change
```

Manual restart: `streamdeck restart com.angelcantugr.devworkflow`

## Reloading Plugin Code vs. Stream Deck Profile Changes

Two different things need two different reloads — don't confuse them:

**Plugin code changed** (anything in `src/`, `manifest.json`, `scripts/`)
— just the plugin process needs to restart. `npm run watch` does this
automatically on every save; to do it manually:
```bash
npm run build                                        # rebuilds bin/plugin.js
streamdeck restart com.angelcantugr.devworkflow       # or let watch/build do this
```
Note: files under `com.angelcantugr.devworkflow.sdPlugin/scripts/` are
read from disk at runtime, not bundled by rollup — editing a `.sh`/`.py`
script takes effect immediately, no rebuild or restart needed at all.

**Stream Deck Profile changed** (a `.sdProfile` bundle under
`~/Library/Application Support/com.elgato.StreamDeck/ProfilesV3/` was
hand-edited directly rather than through the GUI — see
[docs/profile-authoring-reference.md](docs/profile-authoring-reference.md))
— the *whole Stream Deck app* needs to restart; it doesn't live-watch
that directory. Plugin restart alone does nothing for this:
```bash
osascript -e 'quit app "Elgato Stream Deck"'
sleep 2
open -a "Elgato Stream Deck"
```
The `osascript` quit reliably reports `User canceled (-128)` even when it
worked — don't treat that as a real failure. Verify the restart actually
happened by checking for a fresh process instead of trusting the exit
status:
```bash
sleep 2
ps -o pid,lstart,command -p $(pgrep -f "Stream Deck.app/Contents/MacOS/Stream Deck")
```
A `lstart` timestamp matching when you just ran the restart confirms it
took. This is disruptive to the user's other running plugins/sessions —
get their go-ahead before doing it unprompted.

## Adding or Modifying Buttons

All button behaviors live in **`src/config/dev-workflow.config.ts`**:

- **Add an app launcher**: append to `APP_LAUNCHERS` array
- **Add a shell command**: append to `SHELL_COMMANDS` array
- **Add a tmux session**: append to `TMUX_SESSIONS` array
- **Add a script**: append to `SCRIPTS` array, add the `.sh`/`.py` file to `com.angelcantugr.devworkflow.sdPlugin/scripts/`

After editing: `npm run build` (or let `watch` pick it up).

## Adding a New Action Type

1. Create `src/actions/my-action.ts` extending `SingletonAction<MySettings>`
2. Decorate with `@action({ UUID: "com.angelcantugr.devworkflow.my-action" })`
3. Add the action to `com.angelcantugr.devworkflow.sdPlugin/manifest.json` under `"Actions"`
4. Register in `src/plugin.ts`: `streamDeck.actions.registerAction(new MyAction())`
5. Add a property inspector at `com.angelcantugr.devworkflow.sdPlugin/ui/my-action.html`

## SDK Documentation

Check `docs/sdk-capabilities-reference.md` first — a practical map of the
SDK's action model, settings, property-inspector, devices, profiles, system/
app-monitoring, deep-linking, dynamic icons, logging, and manifest fields,
scoped to what this plugin (macOS, Stream Deck XL, Keypad-only) actually
needs. Fall back to Context7 or the live docs for anything it doesn't cover
in enough depth.

### Context7

Use these library IDs with Context7 MCP for always-current SDK docs:

| Library | Context7 ID |
|---|---|
| Stream Deck SDK (TypeScript) | `/elgatosf/streamdeck` |
| Stream Deck CLI reference | `/websites/elgato_streamdeck` |
| Plugin samples | `/elgatosf/streamdeck-plugin-samples` |
| Elgato SDK docs site | `/websites/elgato_streamdeck_sdk` |

Example: `mcp__plugin_context7_context7__query-docs` with `libraryId: "/elgatosf/streamdeck"`.

## Project Structure

```
stream-deck-plugin/
├── CLAUDE.md
├── docs/
│   ├── installed-plugins-actions.md   ← reference: action UUIDs of existing plugins
│   ├── sdk-capabilities-reference.md  ← practical map of the Stream Deck SDK's capabilities
│   ├── claude-desktop-profile.md      ← Claude Desktop Chat/Cowork/Code profile setup
│   ├── profile-authoring-reference.md ← how to hand-author a .sdProfile bundle (unofficial)
│   └── native-primitives-reference.md ← native Folder/Multi-Action/Open/Text/Hotkey/Pages catalog
├── src/
│   ├── plugin.ts                       ← entry point; registers actions
│   ├── config/
│   │   └── dev-workflow.config.ts      ← THE source of truth for all button behaviors
│   ├── actions/
│   │   ├── app-launcher.ts
│   │   ├── shell-command.ts
│   │   ├── tmux-session.ts
│   │   └── script-runner.ts
│   └── utils/
│       └── shell.ts                    ← exec helpers
├── com.angelcantugr.devworkflow.sdPlugin/
│   ├── manifest.json                   ← plugin metadata + action declarations
│   ├── bin/                            ← built output (gitignored)
│   ├── imgs/                           ← icons (replace placeholders with real PNGs)
│   ├── ui/                             ← property inspector HTML files
│   └── scripts/                        ← shell/python scripts called by actions
├── package.json
├── tsconfig.json
└── rollup.config.mjs
```

## Icons

Placeholder icons live in `com.angelcantugr.devworkflow.sdPlugin/imgs/`. Required sizes:
- Plugin icon: 256×256 (`plugin-icon.png`), 512×512 (`plugin-icon@2x.png`)
- Action list icon: 20×20 (`icon.png`), 40×40 (`icon@2x.png`)
- Key image: 72×72 (`key.png`), 144×144 (`key@2x.png`)

## Validation & Packaging

```bash
streamdeck validate                                         # check plugin structure
streamdeck pack com.angelcantugr.devworkflow.sdPlugin      # create .streamDeckPlugin for distribution
```

## Reference

- Installed plugin action IDs: `docs/installed-plugins-actions.md`
- SDK capabilities (settings, devices, profiles, manifest fields, etc.): `docs/sdk-capabilities-reference.md`
- Claude Desktop profile setup (Chat/Cowork/Code): `docs/claude-desktop-profile.md`
- Hand-authoring a `.sdProfile` bundle directly (unofficial): `docs/profile-authoring-reference.md`
- Native primitive catalog (Folder, Multi-Action, Open, Text, Hotkey, Pages, Switch Profile): `docs/native-primitives-reference.md`
- macOS target only — no Windows support
- Node.js 24+, Stream Deck 7.1+, macOS 13+
