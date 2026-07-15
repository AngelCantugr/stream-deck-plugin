// Comet (browser) profile. Arc isn't installed on this machine — Comet is
// the actual daily browser, so it gets the browser profile; add an Arc
// definition later if Arc returns (3 lines, shared nothing).
//
// "Go to URL" keys chain ⌘L (focus address bar) → type URL → Enter.

import { delay, hotkey, multiAction, text } from "../actions/native";
import { statusTile } from "../actions/plugin";
import type { ActionEntry, IconCategory, ProfileSpec } from "../model";

function goToUrl(url: string, title: string, icon: IconCategory): ActionEntry {
    return multiAction([hotkey("cmd+l"), delay(200), text(url)], title, [], icon);
}

export const comet: ProfileSpec = {
    id: "comet",
    name: "Comet (generated)",
    appIdentifier: "/Applications/Comet.app",
    pages: [
        {
            id: "main",
            keys: [
                { col: 0, row: 0, key: statusTile("agent-inbox") },
                { col: 1, row: 0, key: statusTile("tmux-attention") },
                { col: 2, row: 0, key: hotkey("cmd+t", "New\nTab", "browser") },
                { col: 3, row: 0, key: hotkey("cmd+shift+t", "Reopen\nTab", "browser") },
                { col: 4, row: 0, key: hotkey("cmd+l", "Address", "browser") },
                { col: 5, row: 0, key: hotkey("cmd+r", "Reload", "browser") },

                { col: 0, row: 1, key: goToUrl("github.com/pulls", "My\nPRs", "pr") },
                { col: 1, row: 1, key: goToUrl("github.com/notifications", "GH\nNotifs", "report") },
                { col: 2, row: 1, key: goToUrl("localhost:3000", "localhost\n3000", "browser") },
                { col: 3, row: 1, key: goToUrl("localhost:8080", "localhost\n8080", "browser") },
            ],
        },
    ],
};
