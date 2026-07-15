// cmux Nightly profile — agent orchestration hub.
//
// Skill keys use the plugin's cmux Workflow action, which dispatches
// directly into a named cmux workspace over its Unix socket. Text keys
// assume a shell pane is focused inside cmux.
//
// Every cmuxWorkflow()/text() call gets an explicit semantic `icon`
// category — otherwise 20 skill buttons all share the one generic glyph
// and are indistinguishable at a glance.

import { text } from "../actions/native";
import { cmuxWorkflow, statusTile } from "../actions/plugin";
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
                { col: 2, row: 0, key: cmuxWorkflow("skill-dispatch", undefined, "agent-flow") },
                { col: 3, row: 0, key: cmuxWorkflow("skill-land", undefined, "agent-flow") },
                { col: 4, row: 0, key: cmuxWorkflow("skill-pair", undefined, "agent-flow") },
                { col: 5, row: 0, key: cmuxWorkflow("skill-agents-status", undefined, "report") },
                { col: 6, row: 0, key: cmuxWorkflow("skill-agent-inbox", undefined, "ai") },
                { col: 7, row: 0, key: cmuxWorkflow("skill-session-pilot", undefined, "agent-flow") },

                // Row 1 — PR lifecycle
                { col: 0, row: 1, key: cmuxWorkflow("skill-create-pr", undefined, "pr") },
                { col: 1, row: 1, key: cmuxWorkflow("skill-commit-pr-mon", undefined, "pr") },
                { col: 2, row: 1, key: cmuxWorkflow("skill-fix-checks", undefined, "pr") },
                { col: 3, row: 1, key: cmuxWorkflow("skill-address-comments", undefined, "pr") },
                { col: 4, row: 1, key: cmuxWorkflow("skill-merge-mon", undefined, "pr") },
                { col: 5, row: 1, key: cmuxWorkflow("skill-codex-review", undefined, "ai") },
                { col: 6, row: 1, key: cmuxWorkflow("skill-second-opinion", undefined, "ai") },

                // Row 2 — issue → implementation loop + team status
                { col: 0, row: 2, key: cmuxWorkflow("skill-create-issue", undefined, "issue") },
                { col: 1, row: 2, key: cmuxWorkflow("skill-implement-issue", undefined, "issue") },
                { col: 2, row: 2, key: cmuxWorkflow("skill-sdd", undefined, "agent-flow") },
                { col: 3, row: 2, key: cmuxWorkflow("skill-watch-issues", undefined, "issue") },
                { col: 4, row: 2, key: statusTile("claude-session-code") },
                { col: 5, row: 2, key: cmuxWorkflow("skill-team-status", undefined, "report") },
                { col: 6, row: 2, key: cmuxWorkflow("skill-gh-status", undefined, "report") },
                { col: 7, row: 2, key: cmuxWorkflow("skill-gh-daily", undefined, "report") },

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
