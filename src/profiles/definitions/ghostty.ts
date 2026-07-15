// Ghostty profile — auto-switches in whenever Ghostty is frontmost.
//
// Everything here assumes a shell (or Claude Code REPL) has keyboard focus
// in Ghostty: Text keys type the user's own dotenv aliases; row 3 drives a
// live Claude Code REPL directly (Shift+Tab cycles permission modes, Esc
// interrupts, slash-commands are typed in).
//
// Every text()/hotkey() call gets an explicit semantic `icon` category so
// keys are visually distinguishable by what they DO, not by which native
// primitive happens to implement them — a bare `text()` glyph repeated 25+
// times on one profile would be indistinguishable at a glance.

import { hotkey, text } from "../actions/native";
import { statusTile } from "../actions/plugin";
import type { ProfileSpec } from "../model";

export const ghostty: ProfileSpec = {
    id: "ghostty",
    name: "Ghostty (generated)",
    appIdentifier: "/Applications/Ghostty.app",
    pages: [
        {
            id: "main",
            keys: [
                // Row 0 — status + jumpers
                { col: 0, row: 0, key: statusTile("agent-inbox") },
                { col: 1, row: 0, key: statusTile("tmux-attention") },
                { col: 2, row: 0, key: text("tms", { title: "Sessions", icon: "tmux" }) },
                { col: 3, row: 0, key: text("zr", { title: "Repo\nJump", icon: "search" }) },
                { col: 4, row: 0, key: text("gwt", { title: "Work\ntree", icon: "git" }) },
                { col: 5, row: 0, key: text("lgg", { title: "Lazy\nGit", icon: "git" }) },
                { col: 6, row: 0, key: text("daily", { title: "Daily", icon: "notes" }) },
                { col: 7, row: 0, key: text("todo", { title: "Todo", icon: "notes" }) },

                // Row 1 — tmux sessions + Claude launchers
                { col: 0, row: 1, key: text("tsa main", { title: "main", icon: "tmux" }) },
                { col: 1, row: 1, key: text("tsa dev", { title: "dev", icon: "tmux" }) },
                { col: 2, row: 1, key: text("tsa ai", { title: "ai", icon: "tmux" }) },
                { col: 3, row: 1, key: text("tsa cowork", { title: "cowork", icon: "tmux" }) },
                { col: 4, row: 1, key: text("tsa code", { title: "code", icon: "tmux" }) },
                { col: 5, row: 1, key: text("ccont", { title: "CC\nCont", icon: "ai" }) },
                { col: 6, row: 1, key: text("cwt", { title: "CC\nWktree", icon: "git" }) },
                { col: 7, row: 1, key: text("cissue", { title: "CC\nIssue", icon: "issue" }) },

                // Row 2 — git / PR flow
                { col: 0, row: 2, key: text("gs", { title: "git st", icon: "git" }) },
                { col: 1, row: 2, key: text("gsync", { title: "Sync", icon: "git" }) },
                { col: 2, row: 2, key: text("prci", { title: "PR CI", icon: "pr" }) },
                { col: 3, row: 2, key: text("prboard", { title: "PR\nBoard", icon: "pr" }) },
                { col: 4, row: 2, key: text("prfzf", { title: "PR\nFzf", icon: "pr" }) },
                { col: 5, row: 2, key: text("sup", { title: "Standup", icon: "report" }) },
                { col: 6, row: 2, key: text("find-todos", { title: "TODOs", icon: "search" }) },
                { col: 7, row: 2, key: text("scratch", { title: "Scratch", icon: "notes" }) },

                // Row 3 — live Claude Code REPL controls
                { col: 0, row: 3, key: hotkey("shift+tab", "Mode ⇥", "ai") },
                { col: 1, row: 3, key: hotkey("escape", "Esc", "tools") },
                { col: 2, row: 3, key: text("/compact", { title: "Compact", icon: "ai" }) },
                { col: 3, row: 3, key: text("/clear", { title: "Clear", icon: "ai" }) },
                { col: 4, row: 3, key: text("/resume", { title: "Resume", icon: "ai" }) },
                { col: 5, row: 3, key: text("/model", { title: "Model", icon: "ai" }) },
                { col: 6, row: 3, key: text("/context", { title: "Context", icon: "ai" }) },
                { col: 7, row: 3, key: statusTile("pr-checks") },
            ],
        },
    ],
};
