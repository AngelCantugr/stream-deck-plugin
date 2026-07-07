// Dev Workflow Plugin — Settings as Code
//
// This file is the single source of truth for all button behaviors.
// To change what a button does: edit here, run `npm run build`.
// To add a new button: add an entry, rebuild, then drag the action to a Stream Deck key.

// ─── Types ───────────────────────────────────────────────────────────────────

export type LaunchMethod =
    | { type: "bundleId"; value: string }
    | { type: "appName"; value: string }
    | { type: "script"; value: string };

export interface AppLauncherConfig {
    readonly id: string;
    readonly label: string;
    readonly launch: LaunchMethod;
}

export interface ShellCommandConfig {
    readonly id: string;
    readonly label: string;
    readonly command: string;
    readonly runIn: "background" | "terminal";
}

export interface TmuxSessionConfig {
    readonly id: string;
    readonly label: string;
    readonly sessionName: string;
    readonly createIfMissing: boolean;
}

export interface ScriptConfig {
    readonly id: string;
    readonly label: string;
    readonly scriptName: string;
    readonly interpreter: "bash" | "python3";
    readonly args?: readonly string[];
}

// ─── App Launchers ───────────────────────────────────────────────────────────
//
// launch.type options:
//   "bundleId" → open -b <bundleId>  (most reliable, survives app renames)
//   "appName"  → open -a <appName>   (use if bundle ID is unknown)
//   "script"   → runs scripts/<value>.sh  (use for terminal-based apps)

export const APP_LAUNCHERS: readonly AppLauncherConfig[] = [
    {
        id: "cursor",
        label: "Cursor",
        launch: { type: "appName", value: "Cursor" },
    },
    {
        id: "claude-desktop",
        label: "Claude",
        launch: { type: "appName", value: "Claude" },
    },
    {
        id: "claude-code",
        label: "CC",
        // Opens a new terminal tab running the `claude` CLI
        launch: { type: "script", value: "launch-claude-code.sh" },
    },
    {
        id: "tmux",
        label: "tmux",
        // Attaches to the 'main' session or creates it
        launch: { type: "script", value: "launch-tmux.sh" },
    },
    {
        id: "cmux",
        label: "cmux",
        launch: { type: "appName", value: "cmux Nightly" },
    },
    {
        id: "codex",
        label: "Codex",
        launch: { type: "appName", value: "Codex" },
    },
    {
        id: "neovim",
        label: "NeoVim",
        // Opens iTerm2 with nvim
        launch: { type: "script", value: "launch-neovim.sh" },
    },
    {
        id: "arc",
        label: "Arc",
        launch: { type: "bundleId", value: "company.thebrowser.Browser" },
    },
    {
        id: "comet",
        label: "Comet",
        launch: { type: "appName", value: "Comet" },
    },
    {
        id: "antigravity",
        label: "Anti",
        launch: { type: "appName", value: "Antigravity" },
    },
    {
        id: "neovide",
        label: "Neovide",
        launch: { type: "appName", value: "Neovide" },
    },
];

// ─── Shell Commands ──────────────────────────────────────────────────────────
//
// runIn: "terminal" → opens a new Terminal tab with the command
// runIn: "background" → runs silently; only ✓/✗ feedback on the button

export const SHELL_COMMANDS: readonly ShellCommandConfig[] = [
    { id: "git-status",  label: "git st",    command: "git status",                runIn: "terminal" },
    { id: "git-log",     label: "git log",   command: "git log --oneline -15",      runIn: "terminal" },
    { id: "git-diff",    label: "git diff",  command: "git diff",                   runIn: "terminal" },
    { id: "git-pull",    label: "git pull",  command: "git pull",                   runIn: "terminal" },
    { id: "npm-test",    label: "test",      command: "npm test",                   runIn: "terminal" },
    { id: "npm-build",   label: "build",     command: "npm run build",              runIn: "terminal" },
    { id: "npm-dev",     label: "dev",       command: "npm run dev",                runIn: "terminal" },
    { id: "docker-ps",   label: "docker",    command: "docker ps",                  runIn: "terminal" },
    { id: "k8s-ctx",     label: "k8s ctx",   command: "kubectl config get-contexts", runIn: "terminal" },
];

// ─── tmux Sessions ───────────────────────────────────────────────────────────

export const TMUX_SESSIONS: readonly TmuxSessionConfig[] = [
    { id: "main", label: "main", sessionName: "main", createIfMissing: true },
    { id: "dev",  label: "dev",  sessionName: "dev",  createIfMissing: true },
    { id: "ai",   label: "ai",   sessionName: "ai",   createIfMissing: true },
];

// ─── Scripts ─────────────────────────────────────────────────────────────────
//
// Scripts live in com.angelcantugr.devworkflow.sdPlugin/scripts/
// The scriptName is the filename relative to that directory.

export const SCRIPTS: readonly ScriptConfig[] = [
    {
        id: "launch-claude-code",
        label: "CC term",
        scriptName: "launch-claude-code.sh",
        interpreter: "bash",
    },
    {
        id: "launch-neovim",
        label: "nvim",
        scriptName: "launch-neovim.sh",
        interpreter: "bash",
    },
    {
        id: "launch-tmux",
        label: "tmux",
        scriptName: "launch-tmux.sh",
        interpreter: "bash",
    },

    // Claude Desktop profile — Cowork page. Sends a marketplace skill into
    // the "cowork" tmux session (typed into a live `claude` REPL if one's
    // already running there, otherwise starts `claude` fresh with it).
    // See docs/claude-desktop-profile.md for the Folder/Profile layout.
    {
        id: "skill-team-status",
        label: "Team St",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["cowork", "/dev-team:team-status", "cmux Nightly"],
    },
    {
        id: "skill-po-status",
        label: "PO St",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["cowork", "/product-ownership:status", "cmux Nightly"],
    },
    {
        id: "skill-gh-status",
        label: "GH St",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["cowork", "/github-project-management:status", "cmux Nightly"],
    },
    {
        id: "skill-gh-daily",
        label: "GH Daily",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["cowork", "/github-project-management:daily-status", "cmux Nightly"],
    },

    // Claude Desktop profile — Code page. Sends a marketplace skill into
    // the "code" tmux session, same reuse-or-start behavior as above.
    {
        id: "skill-create-pr",
        label: "New PR",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/pr-workflow:create-pr", "cmux Nightly"],
    },
    {
        id: "skill-commit-pr-mon",
        label: "Push PR",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/pr-workflow:commit-push-pr-monitor", "cmux Nightly"],
    },
    {
        id: "skill-clean-audit",
        label: "CC Audit",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/clean-code:audit", "cmux Nightly"],
    },
    {
        id: "skill-watch-issues",
        label: "Watch Is",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/engineering-core:watch-issues", "cmux Nightly"],
    },
    {
        id: "skill-devbasic-stat",
        label: "Dev Stat",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/dev-basic:status", "cmux Nightly"],
    },
    {
        id: "skill-devbasic-cfg",
        label: "Dev Cfg",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/dev-basic:configure", "cmux Nightly"],
    },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function findApp(id: string): AppLauncherConfig | undefined {
    return APP_LAUNCHERS.find((a) => a.id === id);
}

export function findCommand(id: string): ShellCommandConfig | undefined {
    return SHELL_COMMANDS.find((c) => c.id === id);
}

export function findSession(id: string): TmuxSessionConfig | undefined {
    return TMUX_SESSIONS.find((s) => s.id === id);
}

export function findScript(id: string): ScriptConfig | undefined {
    return SCRIPTS.find((s) => s.id === id);
}
