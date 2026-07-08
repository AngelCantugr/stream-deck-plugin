import { execFile as nodeExecFile } from "child_process";
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { promisify } from "util";

const execFileAsync = promisify(nodeExecFile);

// Fallback order mirrors ~/.config/cmux/bin/cmux-worktree-launch's own
// resolution: PATH first (cmux's shell integration puts it there once a
// terminal has been opened by cmux at least once), then each app bundle's
// bundled CLI. Deliberately NOT Contents/MacOS/cmux — that entry point
// launches the GUI app instead of running as a CLI when invoked with
// certain args (confirmed by hanging on `--help`).
const CMUX_APP_CLI_PATHS = [
    "/Applications/cmux NIGHTLY.app/Contents/Resources/bin/cmux",
    "/Applications/cmux.app/Contents/Resources/bin/cmux",
];

const WORKTREE_LAUNCH_SCRIPT = join(homedir(), ".config/cmux/bin/cmux-worktree-launch");

let resolvedBinary: string | undefined;

async function resolveBinary(): Promise<string> {
    if (resolvedBinary) {
        return resolvedBinary;
    }
    try {
        await execFileAsync("cmux", ["version"]);
        resolvedBinary = "cmux";
        return resolvedBinary;
    } catch {
        // Not on PATH — fall back to a known app bundle location.
    }
    for (const path of CMUX_APP_CLI_PATHS) {
        if (existsSync(path)) {
            resolvedBinary = path;
            return resolvedBinary;
        }
    }
    throw new Error("cmux CLI not found on PATH or in /Applications");
}

// CMUX_QUIET silences stderr deprecation notices for legacy command aliases
// (e.g. "list-workspaces" -> "workspace list") — cosmetic only, JSON always
// goes to stdout regardless, but this keeps plugin logs clean.
async function cmux(args: readonly string[]): Promise<string> {
    const bin = await resolveBinary();
    const { stdout } = await execFileAsync(bin, [...args], {
        env: { ...process.env, CMUX_QUIET: "1" },
    });
    return stdout;
}

interface CmuxWorkspace {
    readonly ref: string;
    readonly title: string;
    readonly current_directory?: string;
}

interface ListWorkspacesResult {
    readonly workspaces: readonly CmuxWorkspace[];
}

export async function findWorkspaceByName(name: string): Promise<CmuxWorkspace | undefined> {
    const stdout = await cmux(["list-workspaces", "--json"]);
    const parsed = JSON.parse(stdout) as ListWorkspacesResult;
    return parsed.workspaces.find((w) => w.title === name);
}

// `--workspace` on every cmux subcommand takes an id/ref/index — NOT an
// arbitrary title. Config in dev-workflow.config.ts identifies workspaces
// by title (human-readable, stable across recreation), so every call below
// resolves title -> ref first.
const WORKSPACE_REF_PATTERN = /^(workspace:\d+|[0-9a-f-]{36})$/i;

async function resolveWorkspaceRef(nameOrRef: string): Promise<string> {
    if (WORKSPACE_REF_PATTERN.test(nameOrRef)) {
        return nameOrRef;
    }
    const workspace = await findWorkspaceByName(nameOrRef);
    if (!workspace) {
        throw new Error(`No cmux workspace found with title "${nameOrRef}"`);
    }
    return workspace.ref;
}

// find-or-create the named workspace running a live `claude` session, then
// send text into it. Replaces send-skill-to-session.sh's tmux-attach +
// REPL-detection + Ghostty-AppleScript dance with direct cmux CLI calls.
export async function dispatchToWorkspace(name: string, text: string): Promise<void> {
    let workspace = await findWorkspaceByName(name);
    if (!workspace) {
        await cmux([
            "new-workspace",
            "--name", name,
            "--command", "claude --allow-dangerously-skip-permissions",
            "--focus", "true",
        ]);
        workspace = await findWorkspaceByName(name);
        if (!workspace) {
            throw new Error(`cmux did not report workspace "${name}" after creating it`);
        }
        // Give the shell + claude a moment to finish starting up before
        // typing into it. Confirmed by live testing that 2s was not
        // reliably enough on this machine (heavy zsh config, ~15 plugins
        // loading before the shell hands off to `claude`) — text sent too
        // early lands in the still-loading shell instead of the REPL.
        await new Promise((resolve) => setTimeout(resolve, 3000));
    } else {
        await cmux(["select-workspace", "--workspace", workspace.ref]);
    }

    // Two separate calls, not `send` with a trailing "\n" — confirmed by
    // live testing that a trailing newline does NOT submit in Claude
    // Code's REPL input box, it just inserts a line break and the text
    // sits there unsubmitted. A short gap between them is also required:
    // sending text and Enter back-to-back races the terminal's key
    // handling and the Enter gets swallowed (also confirmed live).
    await cmux(["send", "--workspace", workspace.ref, text]);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await cmux(["send-key", "--workspace", workspace.ref, "enter"]);
}

export type StatusColor = `#${string}`;

export async function setStatus(
    workspace: string,
    key: string,
    value: string,
    opts?: { readonly color?: StatusColor; readonly icon?: string }
): Promise<void> {
    const ref = await resolveWorkspaceRef(workspace);
    const args = ["set-status", key, value, "--workspace", ref];
    if (opts?.color) args.push("--color", opts.color);
    if (opts?.icon) args.push("--icon", opts.icon);
    await cmux(args);
}

export async function clearStatus(workspace: string, key: string): Promise<void> {
    const ref = await resolveWorkspaceRef(workspace);
    await cmux(["clear-status", key, "--workspace", ref]);
}

export async function setProgress(workspace: string, value: number, label?: string): Promise<void> {
    const ref = await resolveWorkspaceRef(workspace);
    const args = ["set-progress", String(value), "--workspace", ref];
    if (label) args.push("--label", label);
    await cmux(args);
}

export async function clearProgress(workspace: string): Promise<void> {
    const ref = await resolveWorkspaceRef(workspace);
    await cmux(["clear-progress", "--workspace", ref]);
}

export async function log(
    workspace: string,
    level: "info" | "warn" | "error",
    message: string
): Promise<void> {
    const ref = await resolveWorkspaceRef(workspace);
    await cmux(["log", "--level", level, "--workspace", ref, message]);
}

export async function triggerFlash(workspace: string): Promise<void> {
    const ref = await resolveWorkspaceRef(workspace);
    await cmux(["trigger-flash", "--workspace", ref]);
}

export interface CmuxStatusTarget {
    readonly workspace: string;
    readonly label: string;
    readonly color?: StatusColor;
}

// Best-effort cmux sidebar feedback around a command: sets a "running"
// status before, clears it (or flips to "failed") after. cmux/network
// failures here are swallowed — a missing workspace or unreachable socket
// should never block the underlying command itself, only skip the sidebar
// feedback for it.
export async function withStatus<T>(status: CmuxStatusTarget | undefined, fn: () => Promise<T>): Promise<T> {
    if (!status) {
        return fn();
    }
    await setStatus(status.workspace, status.label, "running", { color: status.color }).catch(() => {});
    try {
        const result = await fn();
        await clearStatus(status.workspace, status.label).catch(() => {});
        return result;
    } catch (err) {
        await setStatus(status.workspace, status.label, "failed", { color: "#ff3b30" }).catch(() => {});
        throw err;
    }
}

export type WorktreeBase = "default" | "current";
export type WorktreeAgent = "shell" | "claude" | "codex" | "pair";

interface IdentifyResult {
    readonly focused?: { readonly workspace_ref?: string };
}

// cmux-worktree-launch resolves the repo via `git rev-parse --show-toplevel`
// relative to its OWN process cwd — when cmux invokes it directly (its
// normal plus-button use), that cwd is whatever workspace was focused.
// Invoked from this plugin's Node process instead, execFile would
// otherwise inherit the plugin's own cwd (the .sdPlugin directory, itself
// inside this repo) — silently creating every worktree in
// stream-deck-plugin regardless of what project the user is actually
// working in. Resolve the real target explicitly instead.
async function focusedWorkspaceDirectory(): Promise<string | undefined> {
    const identify = JSON.parse(await cmux(["identify", "--json"])) as IdentifyResult;
    const ref = identify.focused?.workspace_ref;
    if (!ref) {
        return undefined;
    }
    const { workspaces } = JSON.parse(await cmux(["list-workspaces", "--json"])) as ListWorkspacesResult;
    return workspaces.find((w) => w.ref === ref)?.current_directory;
}

// Delegates to the user's existing, already-solid worktree launcher rather
// than reimplementing branch naming, worktree creation, or the --agent pair
// split-layout logic here.
export async function runWorktreeLaunch(base: WorktreeBase, agent: WorktreeAgent): Promise<void> {
    const cwd = await focusedWorkspaceDirectory();
    if (!cwd) {
        // No focused cmux workspace (e.g. every window closed but the app
        // still running) — refuse rather than silently falling back to
        // this plugin's own cwd, which would create the worktree inside
        // stream-deck-plugin instead of whatever repo was intended.
        throw new Error(
            "Could not determine the focused cmux workspace's directory — focus a cmux workspace before launching a worktree from it."
        );
    }
    await execFileAsync(WORKTREE_LAUNCH_SCRIPT, ["--base", base, "--agent", agent], { cwd });
}
