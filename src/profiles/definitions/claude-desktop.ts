// Claude Desktop profile — MIGRATED into the generator from the original
// hand-built bundle (docs/claude-desktop-profile.md), pinned to its live
// UUID so the generator adopts the existing directory in place.
//
// Fixes over the hand-built version:
// - Skill keys previously referenced the long-renamed action UUID
//   "…devworkflow.cmux-workflow" — every one of them was a dead button.
//   They now reference the cmux Workflow action correctly.
// - A duplicate "Plan Mode" chord on the Code page is removed.
// - Live status tiles added to the main page.
//
// Layout is unchanged otherwise: flat sibling Pages (Folders don't compose
// with Multi-Actions), main-page nav keys switch Claude Desktop's own tab
// (⌘1/2/3) AND jump the deck to the matching page in one press.

import { gotoPage, hotkey, hotkeyChord, multiAction, open } from "../actions/native";
import { cmuxWorkflow, statusTile } from "../actions/plugin";
import type { ActionEntry, KeyPlacement, ProfileSpec } from "../model";

const CLAUDE_APP = "/Applications/Claude.app";

function tabAndPage(tabHotkey: string, pageIndex: number, title: string): ActionEntry {
    return multiAction([hotkey(tabHotkey), gotoPage(pageIndex)], title);
}

// Claude Desktop's Code tab: ⌘⇧M then 1–5 switches permission mode,
// ⌘⇧I then 1–4 switches model (400ms settle between chord halves).
const mode = (n: string, title: string) => hotkeyChord("cmd+shift+m", n, title, 400, "ai");
const model = (n: string, title: string) => hotkeyChord("cmd+shift+i", n, title, 400, "ai");

function backAndOpen(): KeyPlacement[] {
    return [
        { col: 0, row: 0, key: gotoPage(1, "⬅️ Back") },
        { col: 0, row: 1, key: open(CLAUDE_APP, "Claude") },
    ];
}

export const claudeDesktop: ProfileSpec = {
    id: "claude-desktop",
    uuid: "9e5a675d-7346-4d19-910c-decf2d13a179",
    name: "Claude Desktop",
    appIdentifier: CLAUDE_APP,
    pages: [
        {
            id: "main",
            keys: [
                { col: 0, row: 0, key: tabAndPage("cmd+1", 2, "Chat") },
                { col: 0, row: 1, key: tabAndPage("cmd+2", 3, "Cowork") },
                { col: 0, row: 2, key: tabAndPage("cmd+3", 4, "Code") },
                { col: 6, row: 3, key: statusTile("tmux-attention") },
                { col: 7, row: 3, key: statusTile("agent-inbox") },
            ],
        },
        {
            // Intentionally thin — Claude Desktop exposes no Chat-tab
            // automation surface to script against.
            id: "chat",
            keys: backAndOpen(),
        },
        {
            id: "cowork",
            keys: [
                ...backAndOpen(),
                { col: 0, row: 2, key: cmuxWorkflow("skill-team-status", undefined, "report") },
                { col: 0, row: 3, key: cmuxWorkflow("skill-po-status", undefined, "report") },
                { col: 1, row: 0, key: cmuxWorkflow("skill-gh-status", undefined, "report") },
                { col: 1, row: 1, key: cmuxWorkflow("skill-gh-daily", undefined, "report") },
                { col: 6, row: 3, key: statusTile("tmux-attention") },
                { col: 7, row: 3, key: statusTile("agent-inbox") },
            ],
        },
        {
            id: "code",
            keys: [
                ...backAndOpen(),
                { col: 0, row: 2, key: cmuxWorkflow("skill-create-pr", undefined, "pr") },
                { col: 0, row: 3, key: cmuxWorkflow("skill-commit-pr-mon", undefined, "pr") },
                { col: 1, row: 0, key: cmuxWorkflow("skill-devbasic-stat", undefined, "report") },
                { col: 1, row: 1, key: cmuxWorkflow("skill-devbasic-cfg", undefined, "tools") },
                { col: 2, row: 1, key: cmuxWorkflow("skill-clean-audit", undefined, "tools") },
                { col: 2, row: 2, key: cmuxWorkflow("skill-watch-issues", undefined, "issue") },

                // Permission modes (⌘⇧M → 1..5)
                { col: 1, row: 2, key: mode("1", "Manual") },
                { col: 1, row: 3, key: mode("2", "Accept\nEdits") },
                { col: 2, row: 0, key: mode("3", "Plan\nMode") },
                { col: 3, row: 0, key: mode("4", "Auto\nMode") },
                { col: 3, row: 1, key: mode("5", "Bypass") },

                // Models (⌘⇧I → 1..4)
                { col: 3, row: 2, key: model("1", "Fable 5") },
                { col: 3, row: 3, key: model("2", "Opus\n4.8") },
                { col: 4, row: 0, key: model("3", "Sonnet 5") },
                { col: 4, row: 1, key: model("4", "Haiku\n4.5") },

                { col: 6, row: 3, key: statusTile("tmux-attention") },
                { col: 7, row: 3, key: statusTile("agent-inbox") },
            ],
        },
    ],
};
