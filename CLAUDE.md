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

## SDK Documentation (Context7)

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
│   └── installed-plugins-actions.md   ← reference: action UUIDs of existing plugins
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
- macOS target only — no Windows support
- Node.js 24+, Stream Deck 7.1+, macOS 13+
