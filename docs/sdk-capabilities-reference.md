# Stream Deck SDK Capabilities Reference

A practical map of what the Elgato Stream Deck SDK (Node.js, `@elgato/streamdeck`,
manifest `SDKVersion: 3`) actually offers, scoped to what's relevant for this
plugin (macOS-only, Stream Deck XL, Keypad-only). Sourced from
`docs.elgato.com/streamdeck/sdk/guides/*` and `.../references/*`.

Use this as the "what's possible" reference before adding a new action type
or manifest field — check here first, then the live docs (or Context7,
`/elgatosf/streamdeck`) for anything this doc doesn't cover in enough depth.

---

## 1. Action model

Every action is a `SingletonAction` subclass — "single-instance" refers to
one class handling every key it's assigned to, not one key total; the SDK
lets you iterate all of a plugin's visible instances, which is exactly how
our `configId`-per-key pattern already works (confirmed against the SDK's
own description of the model).

**Lifecycle events available beyond what we currently implement**
(`onWillAppear`, `onKeyDown`, `onPropertyInspectorDidAppear`):

| Event | Fires when |
|---|---|
| `onKeyUp` | Key released (we only handle `onKeyDown`) |
| `onWillDisappear` | Key removed from view (profile/folder switch away) |
| `onTitleParametersDidChange` | User edits the key's title settings in the app |
| `onDidReceiveSettings` | This action's settings changed (from PI or elsewhere) |
| `onDidReceiveGlobalSettings` | Plugin-wide global settings changed (see §2) |
| `onPropertyInspectorDidDisappear` | PI closed |
| `onSendToPlugin` | PI sent a message via `sendToPlugin` (not just `setSettings`) |
| `onDidReceiveResources` / `onDialRotate` / `onDialDown/Up` / `onTouchTap` | Encoder/dial-only — not applicable to our Keypad-only XL |

**Controllers**: manifest `Controllers` is an array of `"Keypad" | "Encoder"`
— confirmed these are the only two values. Omitting the field defaults to
supporting both; being explicit with `["Keypad"]` (as we already do) is
correct and prevents Stream Deck offering the action on Encoder-capable
hardware we don't support.

**Toggle behavior for free**: define **two** entries in an action's manifest
`States` array and Stream Deck automatically toggles between them on press
— no `setState()` call needed, unless `DisableAutomaticStates: true` is set,
in which case the plugin must call `action.setState(n)` itself. Good fit for
something like a future "start/stop watch mode" action where the icon should
reflect real external status rather than click count.

**No long-press event exists** in the SDK — confirmed absent from the
lifecycle list.

---

## 2. Settings — per-action vs. global

Two distinct persistence layers:

```typescript
// Per-action (per-key) — what we already use via configId
await ev.action.setSettings({ count });
let { count = 0 } = ev.payload.settings;
override onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): void { ... }

// Global — plugin-wide, shared across every instance
streamDeck.settings.setGlobalSettings({ preferredTerminalApp: "cmux Nightly" });
let { preferredTerminalApp } = await streamDeck.settings.getGlobalSettings<Settings>();
streamDeck.settings.onDidReceiveGlobalSettings((ev) => { ... });
```

**Key distinction, straight from the docs**: per-action settings are stored
plain-text and get bundled into profile exports; global settings are
encrypted locally. *"Security-sensitive settings, such as access tokens,
should always be persisted using global settings."*

**Relevant to this repo**: the terminal app to raise (`"cmux Nightly"`,
hardcoded per SCRIPTS entry in `dev-workflow.config.ts` — see the Claude
Desktop profile buttons) is a plugin-wide preference duplicated across 10
config entries today. Global settings would let it live in one place,
editable from any one action's property inspector, instead of copy-pasted
into every entry's `args`. Not implemented — just noting the fit.

There's also an experimental flag (Stream Deck 7.1+):
```typescript
streamDeck.settings.useExperimentalMessageIdentifiers = true;
```
Stops `onDidReceive[Global]Settings` from firing on your own `get*` calls —
avoids feedback loops if code ever reads settings and shouldn't treat that
as an external change.

**Validation/defaults**: no dedicated migration API exists. The documented
pattern is destructuring with defaults (`let { name = "default" } = settings`)
or a schema library like Zod for stronger runtime guarantees across plugin
version changes.

---

## 3. Property inspector / UI communication

Plugin → PI: `sendToPropertyInspector` (what our 4 action types already use
to push config lists to the dropdown). PI → Plugin: `sendToPlugin` (note:
this is the event name even though it targets the plugin backend, not
"send to the property inspector").

`didReceiveSettings` fires on **both sides** — plugin-side as
`onDidReceiveSettings`, PI-side whenever `setSettings` is called from
either end, so a re-opened PI picks up settings changed elsewhere.

**We're not using the recommended UI approach.** Elgato ships and
recommends **sdpi-components** — a web-component library
(`sdpi-textfield`, `sdpi-checkbox`, `sdpi-select`, `sdpi-color`,
`sdpi-button`, 20+ components) with a built-in `streamDeckClient` that
handles the WebSocket wiring automatically:

```html
<script src="sdpi-components.js"></script>
<sdpi-item label="Name">
  <sdpi-textfield setting="name"></sdpi-textfield>
</sdpi-item>
```

Our current `ui/*.html` files hand-roll `connectElgatoStreamDeckSocket`,
manual `WebSocket` setup, and manual dropdown population/reset. That's not
wrong — it matches the raw protocol correctly — but sdpi-components would
cut the boilerplate substantially for any *new* property inspector, without
requiring us to rewrite the existing four. Reference:
https://sdpi-components.dev/docs/components/.

**Debugging**: `streamdeck dev` + the remote debugger at
`http://localhost:23654/` lets you inspect a running property inspector in
real dev tools.

---

## 4. Devices

```typescript
const { id, isConnected, name, size, type } = device;
// events: onDeviceDidConnect, onDeviceDidChange (7.0+), onDeviceDidDisconnect
```

**DeviceType enum** (confirmed from the docs):

| ID | Device |
|---|---|
| 0 | Stream Deck (Scissor Keys) |
| 1 | Mini |
| **2** | **XL — this plugin's target** |
| 5 | Pedal |
| 7 | + (Plus) |
| 9 | Neo |
| 13 | + XL |

Caveat: a key/encoder can still appear in the Stream Deck app UI while the
physical device is disconnected — don't treat UI presence as a proxy for
`isConnected`.

Not used today (single fixed XL target), but this is the mechanism for any
future device-aware branching (e.g. adjusting a dynamically-rendered icon
layout for an 8×4 grid specifically).

---

## 5. Profiles

Already the subject of a dedicated write-up — see
[claude-desktop-profile.md §7](claude-desktop-profile.md#7-bundling-the-built-profile-with-the-plugin)
for the full build → export → bundle → `manifest.json` `Profiles` array
workflow, and its limits (`streamDeck.profiles.switchToProfile()` only
reaches profiles *bundled with the plugin*, never a user's own profiles;
there is no `onProfileDidChange` event of any kind).

One point confirmed further in this pass: **whether a profile's Auto-Switch
(per-app) setting survives export/reimport is undocumented** — nothing on
the Profiles guide addresses it either way. Treat as unverified until
tested by actually exporting a profile that has Auto-Switch configured.

---

## 6. System & app monitoring — frontmost-app detection is ruled out

```typescript
streamDeck.system.openUrl(url);              // opens in default browser only — no custom schemes
streamDeck.system.onSystemDidWakeUp((ev) => { /* reconnect/restore state */ });
```

```json
"ApplicationsToMonitor": { "mac": ["com.elgato.WaveLink"], "windows": ["Elgato Wave Link.exe"] }
```
```typescript
streamDeck.system.onApplicationDidLaunch((ev) => { ... });
streamDeck.system.onApplicationDidTerminate((ev) => { ... });
```

**This directly resolves an open question from `claude-desktop-profile.md`'s
original design.** App Monitoring only fires **launch/terminate** events for
apps pre-registered by bundle ID in the manifest — it reports neither which
app currently has focus nor any live "frontmost app changed" signal. There
is no windowing/focus API anywhere in the SDK. **Confirmed: a plugin cannot
detect the frontmost macOS app.** Stream Deck's own native, GUI-configured
per-Profile Auto-Switch feature remains the *only* mechanism for "switch
profile when app X is focused" — which is exactly what the "Terminal"
auto-switch profile in `claude-desktop-profile.md` §5 already relies on.
Nothing here changes that design; it just confirms there's no SDK-level
shortcut around the manual Auto-Switch setup.

(A companion background process using macOS Accessibility/`NSWorkspace`
APIs feeding the plugin over IPC could theoretically detect focus changes —
but that's outside the Stream Deck SDK entirely, a much bigger undertaking,
and not something this doc recommends pursuing for a personal plugin.)

---

## 7. Deep linking

A plugin can receive messages via a `streamdeck://` URL scheme, registered
globally by the Stream Deck app itself (no manifest field needed on the
plugin's side):

```
streamdeck://plugins/message/<PLUGIN_UUID>[/path]["?"query]["#"fragment]
```

```typescript
streamDeck.system.onDidReceiveDeepLink((ev) => {
    const { path, fragment } = ev.url;
    streamDeck.logger.info(`Path = ${path}`);
});
streamDeck.connect();
```

Confirmed invocable from outside Stream Deck — a browser address bar, or
(inferred, not stated verbatim on the page) `open "streamdeck://..."` from a
shell script or a macOS Shortcuts "Open URL" action. Append
`?streamdeck=hidden` to the query string to suppress Stream Deck's window
from coming to the foreground when the link fires.

**What this is not**: it's a message-passing channel *into your own plugin
code* (you write the handler in `onDidReceiveDeepLink`), not a built-in
"trigger this action" or "switch to this profile" API — you'd still write
that logic yourself. It also doesn't help with the original "Claude Desktop
has no URL scheme for its Chat/Cowork/Code tabs" limitation noted in
`claude-desktop-profile.md` — that's a gap in *Claude Desktop*, not
something Stream Deck's deep-linking can paper over, since this scheme only
routes messages to Stream Deck plugins, not to arbitrary other apps.

Not implemented anywhere in this plugin today. Potential future use: a
cmux-workflow-style skill dispatch (see `cmux-integration-reference.md`)
triggered by opening a `streamdeck://` link from elsewhere (e.g. a
Raycast/Alfred command), instead of only from a physical key press.

---

## 8. Dynamic icons — `setImage()`, not the "Resources" guide

Two SDK concepts with confusingly similar names:

- **`action.setResources({ key: filePath })`** — embeds arbitrary files
  (audio, config, scripts) with an action instance so settings stay
  portable across machines on export/import. **Not about images at all.**
- **`action.setImage(image?, options?)`** — this is the actual per-key icon
  API. Accepts a file path, a base64 data URI, *or an SVG string*, and
  resets to the manifest default when called with no argument:

  ```typescript
  const svg = `<svg width="100" height="100">
    <circle fill="${isRed ? "red" : "blue"}" r="45" cx="50" cy="50"></circle>
  </svg>`;
  ev.action.setImage(`data:image/svg+xml,${encodeURIComponent(svg)}`);
  ```

  Precedence: user-defined image (if the user manually assigns one in the
  app) → runtime `setImage()` → manifest default. A plugin **cannot**
  override a user-assigned custom image.

**Relevant to this repo**: today every cmux Workflow button (see
`cmux-integration-reference.md`) shares one static icon regardless of which
skill or worktree variant it triggers — only the title text (`label`)
differs. `setImage()` with an SVG template rendering the label/initials
could give each `CMUX_WORKFLOWS` entry a visually distinct icon at
`onWillAppear` time, with zero new PNG assets. Not implemented — flagged as
a real, low-cost option if the shared-icon UX becomes a problem.

---

## 9. Logging

`streamDeck.logger` is already used in a few `catch` blocks
(`script-runner.ts`, `tmux-session.ts`, `app-launcher.ts`). Confirmed
available beyond `.error()`: `.trace/.debug/.info/.warn/.error`, plus scoped
loggers via `streamDeck.logger.createScope("ModuleName")` for per-module log
prefixes. Manifest `Nodejs.Debug: "enabled"` (already set) controls the Node
inspector/debugger — it is a **separate concern** from log verbosity/level.

Not currently used: `.info`/`.debug` around normal lifecycle events (button
presses, skill dispatches) — logging is presently reactive (only on
failure) rather than giving any trace of normal operation. Worth doing to
trace `cmux.ts`'s find-vs-create branch in `dispatchToWorkspace()` if
workspace-matching-by-title ever misbehaves in the field (see
`cmux-integration-reference.md`).

---

## 10. i18n — deliberately skipped

Manifest/action strings (`Name`, `Description`, `Tooltip`) can be localized
via per-locale JSON files. This is clearly aimed at publicly distributed
plugins with a multi-language user base. For a personal, single-user,
English-only plugin, this isn't worth the maintenance overhead — no action
recommended.

---

## 11. Manifest field checklist

Fields **not currently used**, cross-referenced against the plugin's actual
`manifest.json`:

**Top-level:**

| Field | What it does | Worth adding? |
|---|---|---|
| `$schema` | Points at Elgato's JSON schema for editor autocomplete/validation | Yes — free, zero-risk |
| `ApplicationsToMonitor` | Launch/terminate notifications for specific apps (not frontmost-detection, see §6) | Only if a future action should react to a specific app launching/quitting |
| `Profiles` | Bundles a pre-built `.streamDeckProfile`, auto-installs with the plugin | Yes, for the Claude Desktop profile — see §5 |
| `DefaultWindowSize` | Size for any popup window opened from a PI | Only if a PI ever calls `window.open()` |
| `SupportURL` / `URL` | Support/website links shown on the plugin's page | Skip — personal-use plugin, not distributed |
| `PropertyInspectorPath` (top-level) | Fallback shared PI if an action has none | Skip — every action already has its own |
| `CodePathMac` / `CodePathWin` | Platform-specific entry points | Skip — single `CodePath`, mac-only |

**Per-Action:**

| Field | Default | What it does | Worth adding? |
|---|---|---|---|
| `UserTitleEnabled` | `true` | Lets the user edit the button's title text in the app | Consider `false` for icon-only buttons where a user title would clutter |
| `DisableAutomaticStates` | `false` | Stops auto-toggle between two `States`; plugin must call `setState()` | Only relevant if/when a 2-state toggle action is added |
| `VisibleInActionsList` | `true` | Hide from the actions list (still usable via a shipped Profile) | Only relevant if shipping `Profiles` |
| `SupportedInMultiActions` | `true` | Whether droppable into a Multi-Action | Consider `false` explicitly for anything destructive |
| `DisableCaching` | `false` | Disables icon caching | Only needed for dynamically-generated icons that must never show stale cache (§8) |
| `Encoder` | — | Dial/touchscreen support (Stream Deck +/Studio) | Skip — XL has no dials |

**Confirmed schema notes**: `Controllers` is genuinely limited to
`"Keypad" | "Encoder"` (§1). `States[]` entries support `Image`, `Name`,
`Title`, `ShowTitle`, `TitleAlignment`, `TitleColor`, `FontFamily`,
`FontSize`, `FontStyle`, `FontUnderline`, `MultiActionImage`. `Version`
must be strict 4-part `major.minor.patch.build` — current `1.0.0.0` is
already compliant.

`URI`/deep-linking schemes, `Keywords`, and `FixedTitleSize` **do not
exist** as manifest fields — deep-linking (§7) needs no manifest
registration at all, it's handled entirely by the Stream Deck app.

---

## 12. WebSocket protocol (for deep debugging only)

Our `ui/*.html` files talk to the plugin over a raw WebSocket using
`connectElgatoStreamDeckSocket` and manual `JSON.stringify({event, context,
payload})` — this is intentional, matching the documented low-level
protocol, not a shortcut that should be "fixed." The high-level
`@elgato/streamdeck` Node SDK wraps essentially the full protocol
ergonomically (`setState`, `showOk`, `switchToProfile`, `openUrl`,
`getSecrets`, etc. all confirmed present in the SDK's own type
definitions) — there's no meaningful raw-protocol capability missing from
the Node side that we'd need to hand-roll. Touch-strip layouts
(`references/touch-strip-layout`) are Stream Deck Plus-only and not
applicable to this XL-targeting plugin.

---

## 13. Prioritized recommendations for this repo

Ranked by value vs. effort, none implemented yet — flagged for future work:

1. **Bundle the Claude Desktop profile via `manifest.json`'s `Profiles`
   array** once built (§5) — biggest win for the "settings as code"
   philosophy, already planned in `claude-desktop-profile.md`.
2. **Add `$schema`** to `manifest.json` — zero cost, immediate editor
   validation.
3. ~~Move the shared "preferred terminal app" into global settings instead
   of repeating `"cmux Nightly"` across config entries~~ — moot: skill
   dispatch now targets cmux workspaces directly via the CLI/socket (see
   `cmux-integration-reference.md`), no terminal-app name needed anywhere.
4. **Dynamic per-button icons via `setImage()` + SVG** for the
   `CMUX_WORKFLOWS` buttons, if the shared static icon ever becomes a real
   usability problem (§8).
5. **Scoped, proactive logging** (`createScope`, `.info`/`.debug` beyond
   just error paths) — would help debug `cmux.ts`'s workspace-matching
   logic if it ever misbehaves (§9).
6. Everything else in this doc (i18n, deep-linking, app-monitoring,
   device-aware branching, toggle states) — noted for completeness, no
   concrete need in this plugin today.
