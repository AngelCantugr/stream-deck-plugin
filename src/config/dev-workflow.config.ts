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

export interface StatusSourceConfig {
    readonly id: string;
    readonly label: string;
    // Relative to .sdPlugin/scripts/ — e.g. "status/agent-inbox.sh".
    // Contract: last non-empty stdout line is JSON
    // {"title": string, "value": string, "state": "ok"|"warn"|"alert"|"off", "hint"?: string}
    readonly scriptName: string;
    readonly args?: readonly string[];
    readonly intervalSec: number;
    // Optional key-press behavior; the tile always force-refreshes after it runs.
    readonly pressScript?: {
        readonly scriptName: string;
        readonly args?: readonly string[];
    };
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

    // cmux profile — orchestration skills into the "code"/"cowork" sessions.
    {
        id: "skill-dispatch",
        label: "Dispatch",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/cmux-flow:dispatch", "cmux Nightly"],
    },
    {
        id: "skill-land",
        label: "Land",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/cmux-flow:land", "cmux Nightly"],
    },
    {
        id: "skill-pair",
        label: "Pair",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/cmux-flow:pair", "cmux Nightly"],
    },
    {
        id: "skill-agents-status",
        label: "Agents",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["cowork", "/cmux-flow:agents-status", "cmux Nightly"],
    },
    {
        id: "skill-agent-inbox",
        label: "Inbox",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/agent-results:agent-inbox", "cmux Nightly"],
    },
    {
        id: "skill-session-pilot",
        label: "Pilot",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["cowork", "/workflow-orchestration:session-pilot", "cmux Nightly"],
    },

    // PR lifecycle — the unwired-but-high-value pr-workflow skills.
    {
        id: "skill-fix-checks",
        label: "Fix CI",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/pr-workflow:fix-pr-checks", "cmux Nightly"],
    },
    {
        id: "skill-address-comments",
        label: "PR Cmts",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/pr-workflow:address-pr-comments", "cmux Nightly"],
    },
    {
        id: "skill-merge-mon",
        label: "Merge",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/pr-workflow:merge-pr-monitor", "cmux Nightly"],
    },

    // Issue → implementation loop.
    {
        id: "skill-create-issue",
        label: "New Issue",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/engineering-core:create-issue", "cmux Nightly"],
    },
    {
        id: "skill-implement-issue",
        label: "Impl Issue",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/engineering-core:implement-issue", "cmux Nightly"],
    },
    {
        id: "skill-sdd",
        label: "SDD",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/spec-kit-dev:sdd", "cmux Nightly"],
    },

    // Codex second opinions.
    {
        id: "skill-codex-review",
        label: "Cdx Rev",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/codex-review:quick-review", "cmux Nightly"],
    },
    {
        id: "skill-second-opinion",
        label: "2nd Op",
        scriptName: "send-skill-to-session.sh",
        interpreter: "bash",
        args: ["code", "/engineering-core:second-opinion", "cmux Nightly"],
    },
];

// ─── Status Sources ──────────────────────────────────────────────────────────
//
// Pluggable feeds for the Status Tile action — keys as displays, not buttons.
// Each source is a script under .sdPlugin/scripts/ polled on an interval
// while at least one tile showing it is visible. External events can force
// an instant refresh via:
//   open "streamdeck://plugins/message/com.angelcantugr.devworkflow/refresh?source=<id>&streamdeck=hidden"

export const STATUS_SOURCES: readonly StatusSourceConfig[] = [
    {
        id: "agent-inbox",
        label: "Agent Inbox",
        scriptName: "status/agent-inbox.sh",
        intervalSec: 30,
        // Press: mark inbox read + open the agent-inbox skill in the "code" session.
        pressScript: { scriptName: "status/agent-inbox-open.sh" },
    },
    {
        id: "tmux-attention",
        label: "tmux Attention",
        scriptName: "status/tmux-attention.sh",
        intervalSec: 15,
    },
    {
        id: "pr-checks",
        label: "PR Checks",
        scriptName: "status/gh-pr-checks.sh",
        // Change the repo arg to whichever repo's CI matters most right now.
        args: [`${process.env.HOME}/GithubRepositories/angelcantugr/stream-deck-plugin`],
        intervalSec: 60,
    },
    {
        id: "claude-session-code",
        label: "Claude REPL (code)",
        scriptName: "status/claude-session.sh",
        args: ["code"],
        intervalSec: 15,
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

export function findStatusSource(id: string): StatusSourceConfig | undefined {
    return STATUS_SOURCES.find((s) => s.id === id);
}
