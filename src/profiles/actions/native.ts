// Builders for Stream Deck's native "system" actions.
//
// Schemas are reverse-engineered — copied verbatim from real profiles
// surveyed in docs/native-primitives-reference.md. If a Stream Deck app
// update breaks generated profiles, this file (plus ./plugin.ts) is where
// the schema knowledge lives.

import type { ActionEntry, IconCategory } from "../model";

// ─── Keycodes ────────────────────────────────────────────────────────────────
// NativeCode/VKeyCode = Carbon kVK_ANSI_* virtual keycodes; QTKeyCode = Qt's
// Qt::Key_* enum (ASCII for letters/digits). Formula confirmed against 7+
// real Hotkey entries with zero mismatches (see native-primitives-reference
// §5); Cmd+1/2/3 additionally confirmed by direct on-device testing.

interface KeyCode {
    native: number;
    qt: number;
}

const KEYCODES: Record<string, KeyCode> = {
    a: { native: 0, qt: 65 },
    b: { native: 11, qt: 66 },
    c: { native: 8, qt: 67 },
    d: { native: 2, qt: 68 },
    e: { native: 14, qt: 69 },
    f: { native: 3, qt: 70 },
    g: { native: 5, qt: 71 },
    h: { native: 4, qt: 72 },
    i: { native: 34, qt: 73 },
    j: { native: 38, qt: 74 },
    k: { native: 40, qt: 75 },
    l: { native: 37, qt: 76 },
    m: { native: 46, qt: 77 },
    n: { native: 45, qt: 78 },
    o: { native: 31, qt: 79 },
    p: { native: 35, qt: 80 },
    q: { native: 12, qt: 81 },
    r: { native: 15, qt: 82 },
    s: { native: 1, qt: 83 },
    t: { native: 17, qt: 84 },
    u: { native: 32, qt: 85 },
    v: { native: 9, qt: 86 },
    w: { native: 13, qt: 87 },
    x: { native: 7, qt: 88 },
    y: { native: 16, qt: 89 },
    z: { native: 6, qt: 90 },
    "1": { native: 18, qt: 49 },
    "2": { native: 19, qt: 50 },
    "3": { native: 20, qt: 51 },
    "4": { native: 21, qt: 52 },
    "5": { native: 23, qt: 53 },
    "6": { native: 22, qt: 54 },
    "7": { native: 26, qt: 55 },
    "8": { native: 28, qt: 56 },
    "9": { native: 25, qt: 57 },
    "0": { native: 29, qt: 48 },
    enter: { native: 36, qt: 16777220 },
    tab: { native: 48, qt: 16777217 },
    space: { native: 49, qt: 32 },
    escape: { native: 53, qt: 16777216 },
    grave: { native: 50, qt: 96 },
    comma: { native: 43, qt: 44 },
    period: { native: 47, qt: 46 },
    slash: { native: 44, qt: 47 },
    semicolon: { native: 41, qt: 59 },
    minus: { native: 27, qt: 45 },
    equal: { native: 24, qt: 61 },
    left: { native: 123, qt: 16777234 },
    right: { native: 124, qt: 16777236 },
    down: { native: 125, qt: 16777237 },
    up: { native: 126, qt: 16777235 },
    f5: { native: 96, qt: 16777268 },
    f9: { native: 101, qt: 16777272 },
    f10: { native: 109, qt: 16777273 },
    f11: { native: 103, qt: 16777274 },
};

// KeyModifiers bitmask, confirmed additive: Shift=1, Ctrl=2, Option=4, Cmd=8.
const MODIFIER_BITS: Record<string, number> = {
    shift: 1,
    ctrl: 2,
    option: 4,
    alt: 4,
    cmd: 8,
};

const BLANK_HOTKEY_SLOT = {
    KeyCmd: false,
    KeyCtrl: false,
    KeyOption: false,
    KeyShift: false,
    KeyModifiers: 0,
    NativeCode: -1,
    QTKeyCode: 33554431,
    VKeyCode: -1,
} as const;

function states(title?: string): Array<Record<string, unknown>> {
    return [{ Title: title ?? "" }];
}

function base(entry: Omit<ActionEntry, "LinkedTitle" | "Resources" | "State">): ActionEntry {
    return { LinkedTitle: true, Resources: null, State: 0, ...entry };
}

// ─── Builders ────────────────────────────────────────────────────────────────

// "cmd+shift+m", "shift+tab", "escape" — modifiers in any order, key last.
export function hotkey(spec: string, title?: string, icon?: IconCategory): ActionEntry {
    const parts = spec.toLowerCase().split("+").map((p) => p.trim());
    const keyName = parts[parts.length - 1]!;
    const code = KEYCODES[keyName];
    if (!code) throw new Error(`hotkey("${spec}"): unknown key "${keyName}" — add it to KEYCODES`);

    let modifiers = 0;
    for (const mod of parts.slice(0, -1)) {
        const bit = MODIFIER_BITS[mod];
        if (bit === undefined) throw new Error(`hotkey("${spec}"): unknown modifier "${mod}"`);
        modifiers |= bit;
    }

    return base({
        Name: "Hotkey",
        Plugin: { Name: "Activate a Key Command", UUID: "com.elgato.streamdeck.system.hotkey", Version: "1.0" },
        Settings: {
            Coalesce: true,
            Hotkeys: [
                {
                    KeyCmd: (modifiers & 8) !== 0,
                    KeyCtrl: (modifiers & 2) !== 0,
                    KeyOption: (modifiers & 4) !== 0,
                    KeyShift: (modifiers & 1) !== 0,
                    KeyModifiers: modifiers,
                    NativeCode: code.native,
                    QTKeyCode: code.qt,
                    VKeyCode: code.native,
                },
                BLANK_HOTKEY_SLOT,
                BLANK_HOTKEY_SLOT,
                BLANK_HOTKEY_SLOT,
            ],
        },
        States: states(title),
        UUID: "com.elgato.streamdeck.system.hotkey",
        icon,
    });
}

// Types text into whatever has keyboard focus (pasted as one block).
export function text(
    str: string,
    opts: { enter?: boolean; title?: string; icon?: IconCategory } = {},
): ActionEntry {
    return base({
        Name: "Text",
        Plugin: { Name: "Text", UUID: "com.elgato.streamdeck.system.text", Version: "1.0" },
        Settings: {
            Hotkey: { KeyModifiers: 0, QTKeyCode: 33554431, VKeyCode: -1 },
            isSendingEnter: opts.enter ?? true,
            isTypingMode: false,
            pastedText: str,
        },
        States: states(opts.title),
        UUID: "com.elgato.streamdeck.system.text",
        icon: opts.icon,
    });
}

// Brings the app's most-recent window forward (does NOT create/attach).
// The doubled quotes in Settings.path match the app's own serialization.
export function open(path: string, title?: string, icon?: IconCategory): ActionEntry {
    return base({
        Name: "Open",
        Plugin: { Name: "Open", UUID: "com.elgato.streamdeck.system.open", Version: "1.0" },
        Settings: { path: `"${path}"` },
        States: states(title),
        UUID: "com.elgato.streamdeck.system.open",
        icon,
    });
}

export function delay(ms: number): ActionEntry {
    return base({
        Name: "Delay",
        Plugin: { Name: "Multi Action", UUID: "com.elgato.streamdeck.multiactions", Version: "1.0" },
        Settings: { delay: ms },
        States: states(),
        UUID: "com.elgato.streamdeck.multiactions.delay",
    });
}

// Ordered sequence in one press; optional second sequence on long-press.
export function multiAction(
    steps: ActionEntry[],
    title?: string,
    longPress: ActionEntry[] = [],
    icon?: IconCategory,
): ActionEntry {
    return base({
        Actions: [{ Actions: steps }, { Actions: longPress }],
        Name: "Multi Action",
        Plugin: { Name: "Multi Action", UUID: "com.elgato.streamdeck.multiactions", Version: "1.0" },
        Settings: {},
        States: states(title),
        UUID: "com.elgato.streamdeck.multiactions.routine",
        icon,
    });
}

// Two-key chord (e.g. Claude Desktop's ⌘⇧M then 3) — the Hotkey action's 4
// slots are NOT a confirmed sequential chord, so chords are built as two
// Hotkey steps with a Delay between them (the pattern confirmed working).
export function hotkeyChord(
    first: string,
    second: string,
    title?: string,
    delayMs = 300,
    icon?: IconCategory,
): ActionEntry {
    return multiAction([hotkey(first), delay(delayMs), hotkey(second)], title, [], icon);
}

// PageIndex is 1-indexed: N → top-level manifest Pages.Pages[N-1].
export function gotoPage(pageIndex: number, title?: string, icon?: IconCategory): ActionEntry {
    return base({
        Name: "Go to Page",
        Plugin: { Name: "Pages", UUID: "com.elgato.streamdeck.page.goto", Version: "1.0" },
        Settings: { PageIndex: pageIndex },
        States: states(title),
        UUID: "com.elgato.streamdeck.page.goto",
        icon,
    });
}

export function pageNext(title?: string): ActionEntry {
    return base({
        Name: "Next Page",
        Plugin: { Name: "Pages", UUID: "com.elgato.streamdeck.page.next", Version: "1.0" },
        Settings: {},
        States: states(title),
        UUID: "com.elgato.streamdeck.page.next",
    });
}

export function pagePrevious(title?: string): ActionEntry {
    return base({
        Name: "Previous Page",
        Plugin: { Name: "Pages", UUID: "com.elgato.streamdeck.page.previous", Version: "1.0" },
        Settings: {},
        States: states(title),
        UUID: "com.elgato.streamdeck.page.previous",
    });
}

// Jumps to a different top-level profile (any installed profile — a
// capability plugins' switchToProfile() doesn't have).
export function switchProfile(profileUuid: string, title?: string, pageIndex = 1): ActionEntry {
    return base({
        Name: "Switch Profile",
        Plugin: { Name: "Switch Profile", UUID: "com.elgato.streamdeck.profile.rotate", Version: "1.0" },
        Settings: { DeviceUUID: "", PageIndex: pageIndex, ProfileUUID: profileUuid },
        States: states(title),
        UUID: "com.elgato.streamdeck.profile.rotate",
    });
}
