// Cursor + VS Code Insiders profiles — one shared page function, since
// AppIdentifier is a single app path (no multi-app encoding exists), so
// each editor needs its own profile even though the layouts overlap.

import { hotkey } from "../actions/native";
import { statusTile } from "../actions/plugin";
import type { KeyPlacement, ProfileSpec } from "../model";

// Common VS Code-family keys (Cursor is a VS Code fork — chords match).
function editorKeys(): KeyPlacement[] {
    return [
        { col: 0, row: 0, key: statusTile("agent-inbox") },
        { col: 1, row: 0, key: statusTile("tmux-attention") },
        { col: 2, row: 0, key: hotkey("cmd+shift+p", "Palette", "search") },
        { col: 3, row: 0, key: hotkey("cmd+p", "Quick\nOpen", "search") },
        { col: 4, row: 0, key: hotkey("cmd+shift+f", "Search", "search") },
        { col: 5, row: 0, key: hotkey("ctrl+grave", "Terminal", "tools") },
        { col: 6, row: 0, key: hotkey("ctrl+shift+g", "Git", "git") },

        // Row 1 — debug controls
        { col: 0, row: 1, key: hotkey("f5", "Run/\nDebug", "debug") },
        { col: 1, row: 1, key: hotkey("shift+f5", "Stop", "debug") },
        { col: 2, row: 1, key: hotkey("f9", "Break\npoint", "debug") },
        { col: 3, row: 1, key: hotkey("f10", "Step\nOver", "debug") },
        { col: 4, row: 1, key: hotkey("f11", "Step\nInto", "debug") },
    ];
}

export const cursor: ProfileSpec = {
    id: "cursor",
    name: "Cursor (generated)",
    appIdentifier: "/Applications/Cursor.app",
    pages: [
        {
            id: "main",
            keys: [
                ...editorKeys(),
                // Cursor AI surfaces
                { col: 5, row: 1, key: hotkey("cmd+l", "AI\nChat", "ai") },
                { col: 6, row: 1, key: hotkey("cmd+i", "Agent", "ai") },
                { col: 7, row: 1, key: hotkey("cmd+k", "Inline\nEdit", "ai") },
            ],
        },
    ],
};

export const vscode: ProfileSpec = {
    id: "vscode",
    name: "VS Code Insiders (generated)",
    appIdentifier: "/Applications/Visual Studio Code - Insiders.app",
    pages: [
        {
            id: "main",
            keys: [
                ...editorKeys(),
                // Copilot chat
                { col: 5, row: 1, key: hotkey("ctrl+cmd+i", "Copilot", "ai") },
            ],
        },
    ],
};
