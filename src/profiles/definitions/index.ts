import type { ProfileSpec } from "../model";
import { claudeDesktop } from "./claude-desktop";
import { cmux } from "./cmux";
import { codex } from "./codex";
import { comet } from "./comet";
import { cursor, vscode } from "./editors";
import { ghostty } from "./ghostty";
import { neovide } from "./neovide";

export const ALL_PROFILES: readonly ProfileSpec[] = [
    ghostty,
    cmux,
    cursor,
    vscode,
    neovide,
    comet,
    codex,
    claudeDesktop,
];
