// Codex profile — auto-switches when the ChatGPT desktop app (which hosts
// Codex; LaunchServices resolves "Codex" → /Applications/ChatGPT.app) is
// frontmost. Skill keys push Codex-review work into the "code" tmux session
// alongside whatever's being discussed in the app.

import { statusTile, scriptRunner } from "../actions/plugin";
import type { ProfileSpec } from "../model";

export const codex: ProfileSpec = {
    id: "codex",
    name: "Codex (generated)",
    appIdentifier: "/Applications/ChatGPT.app",
    pages: [
        {
            id: "main",
            keys: [
                { col: 0, row: 0, key: statusTile("agent-inbox") },
                { col: 1, row: 0, key: statusTile("tmux-attention") },
                { col: 2, row: 0, key: scriptRunner("skill-codex-review", undefined, "ai") },
                { col: 3, row: 0, key: scriptRunner("skill-second-opinion", undefined, "ai") },
                { col: 4, row: 0, key: scriptRunner("skill-pair", undefined, "agent-flow") },
                { col: 5, row: 0, key: scriptRunner("skill-agent-inbox", undefined, "ai") },
            ],
        },
    ],
};
