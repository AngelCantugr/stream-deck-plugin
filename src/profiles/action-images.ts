// Maps a top-level key's action UUID to the 144×144 PNG used as its face
// inside a generated profile's Images/ folder.
//
// Confirmed 2026-07-15 by inspecting a real GUI-built profile: EVERY key
// gets an explicit States[].Image copied in by the app, native system
// actions included (Hotkey, Open, Multi Action, …) — not just plugin
// actions. Omitting it does not fall back to any built-in glyph; the key
// renders blank. So every UUID a profile definition can produce as a
// top-level key must be mapped here, or generation fails fast rather than
// shipping a blank key.

import { existsSync } from "node:fs";
import { join } from "node:path";

const SDPLUGIN_DIR = join(process.cwd(), "com.angelcantugr.devworkflow.sdPlugin");

const PLUGIN_ACTION_IMAGES: Record<string, string> = {
    "com.angelcantugr.devworkflow.app-launcher": "actions/app-launcher/key@2x.png",
    "com.angelcantugr.devworkflow.shell-command": "actions/shell-command/key@2x.png",
    "com.angelcantugr.devworkflow.tmux-session": "actions/tmux-session/key@2x.png",
    "com.angelcantugr.devworkflow.script-runner": "actions/script-runner/key@2x.png",
    "com.angelcantugr.devworkflow.status-tile": "actions/status-tile/key@2x.png",
};

// Pages (goto/next/previous) share one generic "page" glyph — direction is
// already conveyed by the key's own title (e.g. "⬅️ Back").
const NATIVE_ACTION_IMAGES: Record<string, string> = {
    "com.elgato.streamdeck.system.hotkey": "native/hotkey/key@2x.png",
    "com.elgato.streamdeck.system.text": "native/text/key@2x.png",
    "com.elgato.streamdeck.system.open": "native/open/key@2x.png",
    "com.elgato.streamdeck.page.goto": "native/page/key@2x.png",
    "com.elgato.streamdeck.page.next": "native/page/key@2x.png",
    "com.elgato.streamdeck.page.previous": "native/page/key@2x.png",
    "com.elgato.streamdeck.multiactions.routine": "native/multiaction/key@2x.png",
};

// Semantic categories (IconCategory in model.ts) — what a key actually DOES,
// independent of whether it's implemented as Text/Hotkey/Multi Action/Script
// Runner. Passed as the trailing `icon` arg on any builder. "tmux" reuses
// the tmux-session plugin action's own icon directly — same concept, no
// separate asset needed.
const CATEGORY_IMAGES: Record<string, string> = {
    git: "native/git/key@2x.png",
    pr: "native/pr/key@2x.png",
    issue: "native/issue/key@2x.png",
    ai: "native/ai/key@2x.png",
    "agent-flow": "native/agent-flow/key@2x.png",
    report: "native/report/key@2x.png",
    notes: "native/notes/key@2x.png",
    search: "native/search/key@2x.png",
    debug: "native/debug/key@2x.png",
    save: "native/save/key@2x.png",
    browser: "native/browser/key@2x.png",
    tools: "native/tools/key@2x.png",
    tmux: "actions/tmux-session/key@2x.png",
};

export function imageSourcePath(idOrCategory: string): string {
    const rel = CATEGORY_IMAGES[idOrCategory] ?? PLUGIN_ACTION_IMAGES[idOrCategory] ?? NATIVE_ACTION_IMAGES[idOrCategory];
    if (!rel) {
        throw new Error(
            `no key image mapped for "${idOrCategory}" — add one to src/profiles/action-images.ts (and scripts/gen-action-icons.py if it's a new glyph)`,
        );
    }
    const full = join(SDPLUGIN_DIR, "imgs", rel);
    if (!existsSync(full)) {
        throw new Error(`key image for "${idOrCategory}" not found at ${full} — run: python3 scripts/gen-action-icons.py`);
    }
    return full;
}
