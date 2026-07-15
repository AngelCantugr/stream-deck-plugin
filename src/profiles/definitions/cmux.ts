// cmux Nightly profile — agent orchestration hub.
//
// Skill keys use the plugin's Script Runner (send-skill-to-session.sh),
// which pushes the slash command into a live Claude REPL in the target tmux
// session. Text keys assume a shell pane is focused inside cmux.
//
// Every scriptRunner()/text() call gets an explicit semantic `icon`
// category — otherwise 20 skill buttons all share the one generic Script
// Runner glyph and are indistinguishable at a glance.

import { text } from "../actions/native";
import { scriptRunner, statusTile } from "../actions/plugin";
import type { ProfileSpec } from "../model";

export const cmux: ProfileSpec = {
    id: "cmux",
    name: "cmux (generated)",
    appIdentifier: "/Applications/cmux NIGHTLY.app",
    pages: [
        {
            id: "main",
            keys: [
                // Row 0 — status + cmux-flow orchestration
                { col: 0, row: 0, key: statusTile("agent-inbox") },
                { col: 1, row: 0, key: statusTile("tmux-attention") },
                { col: 2, row: 0, key: scriptRunner("skill-dispatch", undefined, "agent-flow") },
                { col: 3, row: 0, key: scriptRunner("skill-land", undefined, "agent-flow") },
                { col: 4, row: 0, key: scriptRunner("skill-pair", undefined, "agent-flow") },
                { col: 5, row: 0, key: scriptRunner("skill-agents-status", undefined, "report") },
                { col: 6, row: 0, key: scriptRunner("skill-agent-inbox", undefined, "ai") },
                { col: 7, row: 0, key: scriptRunner("skill-session-pilot", undefined, "agent-flow") },

                // Row 1 — PR lifecycle
                { col: 0, row: 1, key: scriptRunner("skill-create-pr", undefined, "pr") },
                { col: 1, row: 1, key: scriptRunner("skill-commit-pr-mon", undefined, "pr") },
                { col: 2, row: 1, key: scriptRunner("skill-fix-checks", undefined, "pr") },
                { col: 3, row: 1, key: scriptRunner("skill-address-comments", undefined, "pr") },
                { col: 4, row: 1, key: scriptRunner("skill-merge-mon", undefined, "pr") },
                { col: 5, row: 1, key: scriptRunner("skill-codex-review", undefined, "ai") },
                { col: 6, row: 1, key: scriptRunner("skill-second-opinion", undefined, "ai") },

                // Row 2 — issue → implementation loop + team status
                { col: 0, row: 2, key: scriptRunner("skill-create-issue", undefined, "issue") },
                { col: 1, row: 2, key: scriptRunner("skill-implement-issue", undefined, "issue") },
                { col: 2, row: 2, key: scriptRunner("skill-sdd", undefined, "agent-flow") },
                { col: 3, row: 2, key: scriptRunner("skill-watch-issues", undefined, "issue") },
                { col: 4, row: 2, key: statusTile("claude-session-code") },
                { col: 5, row: 2, key: scriptRunner("skill-team-status", undefined, "report") },
                { col: 6, row: 2, key: scriptRunner("skill-gh-status", undefined, "report") },
                { col: 7, row: 2, key: scriptRunner("skill-gh-daily", undefined, "report") },

                // Row 3 — cmux workspace commands (typed into focused pane)
                { col: 0, row: 3, key: text("cw", { title: "Wksp", icon: "tools" }) },
                { col: 1, row: 3, key: text("cwn", { title: "New\nWksp", icon: "tools" }) },
                { col: 2, row: 3, key: text("cmux-layout-dev", { title: "Layout\nDev", icon: "tools" }) },
                { col: 3, row: 3, key: text("cmux-build", { title: "Build", icon: "debug" }) },
                { col: 4, row: 3, key: text("cmux-test", { title: "Test", icon: "debug" }) },
            ],
        },
    ],
};
