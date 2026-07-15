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

// Optional cmux sidebar feedback for a long-running command: shows a
// status pill on the given cmux workspace while the command runs, cleared
// (or flipped to ok/failed) when it finishes. See src/utils/cmux.ts.
export interface CmuxStatusConfig {
    readonly workspace: string;
    readonly label: string;
    readonly color?: `#${string}`;
}

export interface ShellCommandConfig {
    readonly id: string;
    readonly label: string;
    readonly command: string;
    readonly runIn: "background" | "terminal";
    readonly cmuxStatus?: CmuxStatusConfig;
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
    readonly cmuxStatus?: CmuxStatusConfig;
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

// ─── cmux Workflows ──────────────────────────────────────────────────────────
//
// Drives cmux directly via src/utils/cmux.ts (Unix-socket CLI) instead of
// tmux + AppleScript. Two kinds:
//   "skill"    → find-or-create a named cmux workspace running `claude`,
//                send it a marketplace skill slash-command.
//   "worktree" → invoke the user's existing worktree+agent launcher
//                (~/.config/cmux/bin/cmux-worktree-launch), same script
//                already wired into cmux's own plus-button menu.

export type CmuxWorkflowConfig =
    | {
          readonly id: string;
          readonly label: string;
          readonly kind: "skill";
          readonly workspace: string;
          readonly skill: string;
      }
    | {
          readonly id: string;
          readonly label: string;
          readonly kind: "worktree";
          readonly base: "default" | "current";
          readonly agent: "shell" | "claude" | "codex" | "pair";
      };

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
    // runIn: "background" (not "terminal") so the plugin actually awaits
    // the process and can report real running/ok/failed state to the cmux
    // sidebar — runInTerminal's AppleScript `do script` is fire-and-forget
    // and returns before the command finishes, so status tracking on a
    // "terminal" command would clear instantly instead of on completion.
    {
        id: "npm-test", label: "test", command: "npm test", runIn: "background",
        cmuxStatus: { workspace: "Code", label: "test", color: "#ff9500" },
    },
    {
        id: "npm-build", label: "build", command: "npm run build", runIn: "background",
        cmuxStatus: { workspace: "Code", label: "build", color: "#ff9500" },
    },
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
];

export const CMUX_WORKFLOWS: readonly CmuxWorkflowConfig[] = [
    // Claude Desktop profile — Cowork page. Finds or creates the "Cowork"
    // cmux workspace (running `claude`) and sends it a marketplace skill.
    // See docs/claude-desktop-profile.md for the page layout.
    { id: "skill-team-status", label: "Team St", kind: "skill", workspace: "Cowork", skill: "/dev-team:team-status" },
    { id: "skill-po-status", label: "PO St", kind: "skill", workspace: "Cowork", skill: "/product-ownership:status" },
    { id: "skill-gh-status", label: "GH St", kind: "skill", workspace: "Cowork", skill: "/github-project-management:status" },
    { id: "skill-gh-daily", label: "GH Daily", kind: "skill", workspace: "Cowork", skill: "/github-project-management:daily-status" },

    // Claude Desktop profile — Code page. Finds or creates the "Code"
    // cmux workspace, same reuse-or-start behavior as above.
    { id: "skill-create-pr", label: "New PR", kind: "skill", workspace: "Code", skill: "/pr-workflow:create-pr" },
    { id: "skill-commit-pr-mon", label: "Push PR", kind: "skill", workspace: "Code", skill: "/pr-workflow:commit-push-pr-monitor" },
    { id: "skill-clean-audit", label: "CC Audit", kind: "skill", workspace: "Code", skill: "/clean-code:audit" },
    { id: "skill-watch-issues", label: "Watch Is", kind: "skill", workspace: "Code", skill: "/engineering-core:watch-issues" },
    { id: "skill-devbasic-stat", label: "Dev Stat", kind: "skill", workspace: "Code", skill: "/dev-basic:status" },
    { id: "skill-devbasic-cfg", label: "Dev Cfg", kind: "skill", workspace: "Code", skill: "/dev-basic:configure" },

    // cmux profile — orchestration skills into the Code/Cowork workspaces.
    { id: "skill-dispatch", label: "Dispatch", kind: "skill", workspace: "Code", skill: "/cmux-flow:dispatch" },
    { id: "skill-land", label: "Land", kind: "skill", workspace: "Code", skill: "/cmux-flow:land" },
    { id: "skill-pair", label: "Pair", kind: "skill", workspace: "Code", skill: "/cmux-flow:pair" },
    { id: "skill-agents-status", label: "Agents", kind: "skill", workspace: "Cowork", skill: "/cmux-flow:agents-status" },
    { id: "skill-agent-inbox", label: "Inbox", kind: "skill", workspace: "Code", skill: "/agent-results:agent-inbox" },
    { id: "skill-session-pilot", label: "Pilot", kind: "skill", workspace: "Cowork", skill: "/workflow-orchestration:session-pilot" },

    // PR lifecycle — the unwired-but-high-value pr-workflow skills.
    { id: "skill-fix-checks", label: "Fix CI", kind: "skill", workspace: "Code", skill: "/pr-workflow:fix-pr-checks" },
    { id: "skill-address-comments", label: "PR Cmts", kind: "skill", workspace: "Code", skill: "/pr-workflow:address-pr-comments" },
    { id: "skill-merge-mon", label: "Merge", kind: "skill", workspace: "Code", skill: "/pr-workflow:merge-pr-monitor" },

    // Issue → implementation loop.
    { id: "skill-create-issue", label: "New Issue", kind: "skill", workspace: "Code", skill: "/engineering-core:create-issue" },
    { id: "skill-implement-issue", label: "Impl Issue", kind: "skill", workspace: "Code", skill: "/engineering-core:implement-issue" },
    { id: "skill-sdd", label: "SDD", kind: "skill", workspace: "Code", skill: "/spec-kit-dev:sdd" },

    // Codex second opinions.
    { id: "skill-codex-review", label: "Cdx Rev", kind: "skill", workspace: "Code", skill: "/codex-review:quick-review" },
    { id: "skill-second-opinion", label: "2nd Op", kind: "skill", workspace: "Code", skill: "/engineering-core:second-opinion" },

    // Worktree + agent launch — delegates to ~/.config/cmux/bin/cmux-worktree-launch,
    // the same script already wired into cmux's own plus-button menu
    // (see ~/GithubRepositories/angelcantugr/dotenv/stow-packages/cmux/.config/cmux/cmux.json).
    { id: "wt-new-shell", label: "WT New", kind: "worktree", base: "default", agent: "shell" },
    { id: "wt-branch-shell", label: "WT Branch", kind: "worktree", base: "current", agent: "shell" },
    { id: "wt-new-claude", label: "WT+Claude", kind: "worktree", base: "default", agent: "claude" },
    { id: "wt-new-codex", label: "WT+Codex", kind: "worktree", base: "default", agent: "codex" },
    { id: "wt-new-pair", label: "WT Pair", kind: "worktree", base: "default", agent: "pair" },
    { id: "wt-branch-claude", label: "Exp+Claude", kind: "worktree", base: "current", agent: "claude" },
    { id: "wt-branch-codex", label: "Exp+Codex", kind: "worktree", base: "current", agent: "codex" },
    { id: "wt-branch-pair", label: "Exp Pair", kind: "worktree", base: "current", agent: "pair" },
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

export function findCmuxWorkflow(id: string): CmuxWorkflowConfig | undefined {
    return CMUX_WORKFLOWS.find((w) => w.id === id);
}
