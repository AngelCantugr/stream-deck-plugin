// Typed model for profiles-as-code.
//
// A ProfileSpec describes one auto-switching .sdProfile bundle; builder
// functions in ./actions/ produce ActionEntry objects matching the
// reverse-engineered schema in docs/profile-authoring-reference.md and
// docs/native-primitives-reference.md. The emitter (./emit.ts) turns specs
// into on-disk bundles under ProfilesV3/.

// Semantic categories for key-face icons — independent of which native or
// plugin primitive implements the key. Without this, every text()/hotkey()/
// scriptRunner() call on a profile collapses to the same one generic icon
// per primitive type regardless of what the key actually does (git status
// and a Claude slash-command both being "Text" is invisible to the user;
// it shouldn't look that way on the device). See
// src/profiles/action-images.ts for the category → PNG mapping.
export type IconCategory =
    | "git"
    | "pr"
    | "issue"
    | "ai"
    | "agent-flow"
    | "report"
    | "notes"
    | "search"
    | "debug"
    | "save"
    | "browser"
    | "tools"
    | "tmux";

// A key's action entry as serialized in a page manifest, minus ActionID —
// the emitter injects deterministic ActionIDs (see ./ids.ts) at write time,
// including into nested Multi-Action steps.
export interface ActionEntry {
    Name: string;
    Plugin: { Name: string; UUID: string; Version: string };
    Settings: Record<string, unknown>;
    States: Array<Record<string, unknown>>;
    UUID: string;
    // Multi-Action carries its steps at the top level: Actions[0] = short
    // press, Actions[1] = long press.
    Actions?: Array<{ Actions: ActionEntry[] }>;
    LinkedTitle?: boolean;
    Resources?: null;
    State?: number;
    // NOT written to disk — stripped by the emitter before serialization.
    // Overrides the key-face image the emitter would otherwise pick from
    // this entry's UUID (see action-images.ts). Falls back to the generic
    // per-primitive icon when omitted.
    icon?: IconCategory;
}

export interface KeyPlacement {
    // Zero-indexed grid position. XL: col 0–7, row 0–3. Serialized as
    // "col,row" — col FIRST (a real past bug came from assuming row-first).
    readonly col: number;
    readonly row: number;
    readonly key: ActionEntry;
}

export interface PageSpec {
    // Stable page slug — part of the page's UUIDv5 identity. Renaming it
    // re-identifies the page (usually harmless; same-profile pages are
    // addressed by array position, not UUID).
    readonly id: string;
    readonly keys: readonly KeyPlacement[];
}

export interface ProfileSpec {
    // Stable slug; the profile's UUIDv5 identity derives from it.
    readonly id: string;
    // Pin to adopt an existing profile directory (e.g. the hand-built
    // Claude Desktop profile) instead of deriving a fresh identity.
    readonly uuid?: string;
    readonly name: string;
    // Absolute app path for Auto-Switch (e.g. "/Applications/Ghostty.app").
    // Omit for a profile that never switches in automatically.
    readonly appIdentifier?: string;
    // pages[0] is the home page (Pages.Current). A separate empty Default
    // page is always auto-added by the emitter — never list it here.
    readonly pages: readonly PageSpec[];
}

export const XL_COLS = 8;
export const XL_ROWS = 4;

export function validateSpec(spec: ProfileSpec): void {
    if (spec.pages.length === 0) throw new Error(`profile ${spec.id}: needs at least one page`);
    for (const page of spec.pages) {
        const seen = new Set<string>();
        for (const { col, row } of page.keys) {
            if (col < 0 || col >= XL_COLS || row < 0 || row >= XL_ROWS) {
                throw new Error(
                    `profile ${spec.id}, page ${page.id}: key at ${col},${row} is off an XL grid (col 0-${XL_COLS - 1}, row 0-${XL_ROWS - 1})`,
                );
            }
            const pos = `${col},${row}`;
            if (seen.has(pos)) {
                throw new Error(`profile ${spec.id}, page ${page.id}: duplicate key at ${pos}`);
            }
            seen.add(pos);
        }
    }
}
