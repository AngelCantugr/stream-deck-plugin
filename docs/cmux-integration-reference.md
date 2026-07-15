# cmux Integration Reference

How this plugin drives [cmux](https://cmux.com) — the terminal multiplexer
built for coding agents — directly over its Unix-socket CLI, and what that
replaced. See [claude-desktop-profile.md](claude-desktop-profile.md) for
how the Cowork/Code page buttons use this.

---

## 1. Why this exists

The plugin used to dispatch Claude Code skills into a named tmux session
via `send-skill-to-session.sh`: attach-or-create the tmux session, guess
whether a live `claude` REPL was already running in it (checking
`pane_current_command`), `tmux send-keys` the skill text, and fall back to
opening a new Ghostty window via AppleScript if nothing was attached yet.
That script had several documented, unresolved caveats — most notably that
cmux's own automation surface was believed unpublished ("cmux's README
defers to `cmux.com/docs/api`").

It isn't unpublished. `cmux Nightly.app` (and the stable `cmux.app`) ships
a CLI at `Contents/Resources/bin/cmux` that talks to the running app over
a Unix domain socket, with a full command surface: workspace/pane/surface
management, deterministic text/key injection into a specific surface,
sidebar status/progress/log reporting, and more (`cmux --help` for the
complete list; `cmux capabilities --json` for the live RPC method list).
`src/utils/cmux.ts` wraps the subset of that surface this plugin needs.

---

## 2. Prerequisite: socket access mode

cmux's socket defaults to `automation.socketControlMode: "cmuxOnly"` in
`~/.config/cmux/cmux.json` — only processes spawned *by* cmux itself may
connect. The Stream Deck plugin's Node process is not, so this must be
loosened. This machine's cmux config (symlinked from
`~/GithubRepositories/angelcantugr/dotenv/stow-packages/cmux/.config/cmux/cmux.json`)
is set to `"allowAll"` — any local process can control cmux over the
socket, no password. That's a real trust boundary tradeoff (any other app
or script running as you could also drive cmux); `"password"` mode
(`automation.socketPassword` + `CMUX_SOCKET_PASSWORD` env) is the
narrower alternative if that boundary ever needs tightening.

**This setting is not hot-reloaded.** Unlike the rest of `cmux.json`
(which the app file-watches and applies live, confirmed by the
`cmux-settings` skill docs), `socketControlMode` is only read at app
startup — changing it requires quitting and relaunching cmux, not just
`cmux reload-config`. Confirmed by testing: after editing the file, `cmux
ping` kept failing with `Failed to write to socket (Broken pipe, errno
32)` until the app was restarted, after which it returned `PONG`.

---

## 3. `src/utils/cmux.ts`

Thin `execFile`-based wrapper, following the same never-string-interpolate
pattern as `src/utils/shell.ts`.

**Binary resolution** (cached after first success): `cmux` on `PATH` →
`/Applications/cmux NIGHTLY.app/Contents/Resources/bin/cmux` →
`/Applications/cmux.app/Contents/Resources/bin/cmux`. Deliberately *not*
`Contents/MacOS/cmux` — that entry point launches the GUI app instead of
running as a CLI for at least some invocations (confirmed: `--help` hangs
rather than printing).

**Workspace targeting by title, not ref.** Every cmux CLI flag that takes
a workspace (`--workspace <id|ref|index>`) wants a ref/UUID/index — not an
arbitrary name. This plugin's config identifies workspaces by their
human-readable title (`"Cowork"`, `"Code"` — stable across recreation,
unlike a ref). `resolveWorkspaceRef()` resolves title → `cmux
list-workspaces --json` → matching `.ref` before every call that needs one.

**Exports:**

| Function | What it does |
|---|---|
| `findWorkspaceByName(name)` | `list-workspaces --json`, match on `title`. |
| `dispatchToWorkspace(name, text)` | Find-or-create the named workspace running `claude --allow-dangerously-skip-permissions`, then `select-workspace` + `send` + `send-key enter`. |
| `setStatus` / `clearStatus` | `set-status` / `clear-status` — sidebar status pill. |
| `setProgress` / `clearProgress` | `set-progress` / `clear-progress` — sidebar progress bar. |
| `log` | `log --level <info\|warn\|error>` — sidebar log entry. |
| `triggerFlash` | `trigger-flash` — attention cue on a workspace/surface. |
| `withStatus(status, fn)` | Best-effort wrapper: sets `"running"` before `fn()`, clears on success or sets `"failed"` on throw. cmux/socket errors here are swallowed — a missing workspace should never block the underlying command. |
| `runWorktreeLaunch(base, agent)` | Shells out to `~/.config/cmux/bin/cmux-worktree-launch` — see §5. |

---

## 4. Skill dispatch (`CmuxWorkflowConfig`, `kind: "skill"`)

Replaces the `skill-*` `SCRIPTS` entries and `send-skill-to-session.sh`.
Config lives in `src/config/dev-workflow.config.ts`:

```ts
{ id: "skill-create-pr", label: "New PR", kind: "skill", workspace: "Code", skill: "/pr-workflow:create-pr" }
```

`com.angelcantugr.devworkflow.cmux-workflow` (`src/actions/cmux-workflow.ts`)
calls `dispatchToWorkspace(config.workspace, config.skill)` on key-down.
No tmux, no `pane_current_command` REPL-sniffing, no Ghostty/Terminal
AppleScript fallback — `cmux new-workspace --focus true` puts the
workspace in front natively when one doesn't already exist.

**Two non-obvious things confirmed by live testing against a real
workspace, not assumed from the docs:**

- `cmux send --workspace <ref> "text\n"` does **not** submit in Claude
  Code's REPL input box — the trailing newline just inserts a line break
  and the text sits there unsubmitted. Submission needs a separate
  `cmux send-key --workspace <ref> enter` call after the text.
- That `send-key enter` call needs a short gap (300ms) after `send`, not
  back-to-back — sent immediately after, it raced the terminal's key
  handling and got silently swallowed (text stayed in the input box with
  no Enter applied at all).
- The post-creation settle delay before the first send is 3s, not the
  1.5s originally guessed — this machine's shell config loads ~15 zsh
  plugins before handing off to `claude`, and 2s wasn't reliably enough
  in testing (text sent too early landed in the still-loading shell).

**Known caveat:** no locking against two very-fast presses of the same
button racing the find-or-create check (same category of gap the old
script had — "no locking" — just narrower: a race window during creation
only, not general keystroke interleaving into an ambiguous REPL).

---

## 5. Worktree / multi-agent launch (`CmuxWorkflowConfig`, `kind: "worktree"`)

```ts
{ id: "wt-new-pair", label: "WT Pair", kind: "worktree", base: "default", agent: "pair" }
```

Delegates entirely to the user's existing
`~/.config/cmux/bin/cmux-worktree-launch --base <default|current> --agent
<shell|claude|codex|pair>` — already wired into cmux's own plus-button
context menu and Cmd+Shift+T (see
`~/GithubRepositories/angelcantugr/dotenv/stow-packages/cmux/.config/cmux/cmux.json`'s
`actions` section). That script generates a branch name, creates the git
worktree, and opens it as a new cmux workspace — `--agent pair` opens
Claude and Codex side by side in a split. Nothing about worktree creation
or layout is reimplemented in this plugin; `runWorktreeLaunch()` is a
thin `execFile` call into that script.

**`cwd` matters and is not the plugin's own directory.**
`cmux-worktree-launch` resolves the target repo via `git rev-parse
--show-toplevel` relative to its own process `cwd`. When cmux itself runs
the script (its normal plus-button use), that `cwd` is whatever workspace
was focused at the time — but a plain `execFile` from this plugin's Node
process would otherwise inherit *the plugin's own* `cwd` (the `.sdPlugin`
directory, itself inside this repo), silently creating every worktree in
`stream-deck-plugin` regardless of what project is actually open in cmux.
`runWorktreeLaunch()` resolves the real target first — `cmux identify
--json` → `focused.workspace_ref` → matching entry's `current_directory`
in `cmux list-workspaces --json` — and passes that as the child process's
`cwd`. Confirmed live: `identify`'s `focused.workspace_ref` and
`list-workspaces`' `current_directory` cross-reference correctly.

**Fails loudly instead of falling back silently.** The first version of
this resolution returned `undefined` when cmux had no focused workspace
(e.g. every window closed but the app still running), and
`runWorktreeLaunch` would then proceed anyway with the default `cwd` —
silently reintroducing the exact wrong-repo bug this whole resolution step
exists to prevent. Caught in code review, not live testing. Fixed:
`runWorktreeLaunch` now throws (surfaced through `CmuxWorkflow`'s existing
catch as a logged error + `showAlert()`) rather than launching with an
unresolved `cwd`.

The actual worktree-creation side effect (new branch + directory) was
deliberately *not* exercised live during this change, to avoid leaving
throwaway worktrees/branches behind — verify with a real key press before
relying on it.

---

## 6. Sidebar status feedback (`CmuxStatusConfig`)

Additive — no new action type. `ShellCommandConfig` and `ScriptConfig`
both gained an optional field:

```ts
cmuxStatus?: { workspace: string; label: string; color?: `#${string}` }
```

`shell-command.ts` and `script-runner.ts` wrap their execution with
`withStatus(config.cmuxStatus, () => ...)`. Applied to `npm-test` and
`npm-build` in `SHELL_COMMANDS` as the first real usage — note both were
switched from `runIn: "terminal"` to `runIn: "background"` for this to be
meaningful: `runInTerminal()`'s AppleScript `do script` is fire-and-forget
and returns before the command finishes, so a status wrapped around it
would clear instantly instead of tracking real completion.
