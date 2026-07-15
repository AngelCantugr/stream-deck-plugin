// Neovide profile — GUI Neovim. (Terminal nvim is covered by the Ghostty
// profile.)
//
// Neovim is modal, so every command key is a Multi-Action that presses
// Escape first (back to normal mode), then types the ex-command — a bare
// Text key would spray characters into insert mode.

import { delay, hotkey, multiAction, text } from "../actions/native";
import { statusTile } from "../actions/plugin";
import type { ActionEntry, IconCategory, ProfileSpec } from "../model";

function exCommand(cmd: string, title: string, icon: IconCategory): ActionEntry {
    return multiAction([hotkey("escape"), delay(100), text(cmd)], title, [], icon);
}

export const neovide: ProfileSpec = {
    id: "neovide",
    name: "Neovide (generated)",
    appIdentifier: "/Applications/Neovide.app",
    pages: [
        {
            id: "main",
            keys: [
                { col: 0, row: 0, key: statusTile("agent-inbox") },
                { col: 1, row: 0, key: statusTile("tmux-attention") },
                { col: 2, row: 0, key: exCommand(":w", "Save", "save") },
                { col: 3, row: 0, key: exCommand(":wa", "Save\nAll", "save") },
                { col: 4, row: 0, key: exCommand(":qa", "Quit\nAll", "save") },

                { col: 0, row: 1, key: exCommand(":Telescope find_files", "Find\nFiles", "search") },
                { col: 1, row: 1, key: exCommand(":Telescope live_grep", "Grep", "search") },
                { col: 2, row: 1, key: exCommand(":Telescope buffers", "Buffers", "search") },
                { col: 3, row: 1, key: exCommand(":Telescope oldfiles", "Recent", "search") },

                { col: 0, row: 2, key: exCommand(":LazyGit", "Lazy\nGit", "git") },
                { col: 1, row: 2, key: exCommand(":Lazy", "Plugins", "tools") },
                { col: 2, row: 2, key: exCommand(":Mason", "LSP\nMason", "tools") },
                { col: 3, row: 2, key: exCommand(":checkhealth", "Health", "debug") },
            ],
        },
    ],
};
