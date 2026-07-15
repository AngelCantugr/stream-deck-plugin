// SVG tile renderer for the Status Tile action.
//
// Pure functions: StatusPayload in, `data:image/svg+xml;base64,…` out —
// passed to `action.setImage()`. Keys render at 144×144 (72pt @2x).
// Palette is Catppuccin Mocha to match the rest of the dev environment.

export type StatusState = "ok" | "warn" | "alert" | "off";

export interface StatusPayload {
    readonly title: string;
    readonly value: string;
    readonly state: StatusState;
    readonly hint?: string;
}

const MOCHA = {
    base: "#1e1e2e",
    crust: "#11111b",
    text: "#cdd6f4",
    subtext: "#7f849c",
    ok: "#a6e3a1",
    warn: "#f9e2af",
    alert: "#f38ba8",
    off: "#6c7086",
} as const;

function escapeXml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function toDataUri(svg: string): string {
    return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

// Value font scales down as the string grows so "142" still fits.
function valueFontSize(value: string): number {
    if (value.length <= 2) return 58;
    if (value.length <= 4) return 42;
    if (value.length <= 6) return 30;
    return 22;
}

export function renderTile(p: StatusPayload): string {
    const accent = MOCHA[p.state];
    // Alert tiles invert: loud accent background, dark text — visible at a glance.
    const inverted = p.state === "alert";
    const bg = inverted ? accent : MOCHA.base;
    const valueColor = inverted ? MOCHA.crust : accent;
    const titleColor = inverted ? MOCHA.crust : MOCHA.subtext;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="16" fill="${bg}"/>
  ${inverted ? "" : `<rect x="0" y="0" width="144" height="8" rx="4" fill="${accent}"/>`}
  <text x="72" y="82" text-anchor="middle" font-family="-apple-system, Helvetica, sans-serif" font-weight="700" font-size="${valueFontSize(p.value)}" fill="${valueColor}">${escapeXml(p.value)}</text>
  <text x="72" y="126" text-anchor="middle" font-family="-apple-system, Helvetica, sans-serif" font-weight="600" font-size="17" fill="${titleColor}">${escapeXml(p.title)}</text>
</svg>`;
    return toDataUri(svg);
}

export function renderErrorTile(label: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
  <rect width="144" height="144" rx="16" fill="${MOCHA.base}"/>
  <text x="72" y="86" text-anchor="middle" font-family="-apple-system, Helvetica, sans-serif" font-weight="700" font-size="58" fill="${MOCHA.off}">?</text>
  <text x="72" y="126" text-anchor="middle" font-family="-apple-system, Helvetica, sans-serif" font-weight="600" font-size="17" fill="${MOCHA.off}">${escapeXml(label)}</text>
</svg>`;
    return toDataUri(svg);
}

const VALID_STATES: readonly string[] = ["ok", "warn", "alert", "off"];

// Parses a status script's stdout. Contract: the LAST non-empty line is one
// JSON object {title, value, state, hint?} — earlier lines are tolerated so
// scripts can emit debug noise without breaking the tile.
export function parseStatusPayload(stdout: string): StatusPayload {
    const lines = stdout
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    const last = lines[lines.length - 1];
    if (!last) throw new Error("status script produced no output");

    const raw: unknown = JSON.parse(last);
    if (typeof raw !== "object" || raw === null) throw new Error("status payload is not an object");
    const obj = raw as Record<string, unknown>;

    const title = typeof obj.title === "string" ? obj.title : "";
    const value = typeof obj.value === "string" ? obj.value : String(obj.value ?? "?");
    const state = typeof obj.state === "string" && VALID_STATES.includes(obj.state)
        ? (obj.state as StatusState)
        : "off";
    const hint = typeof obj.hint === "string" ? obj.hint : undefined;

    return { title, value, state, hint };
}
