// Emitter: ProfileSpec → .sdProfile bundle on disk.
//
// Identity and idempotency come from deterministic UUIDs (./ids.ts): the
// same spec always produces the same directory name and the same content,
// so regeneration updates a profile in place. A .generated.json sidecar
// records a canonical content hash; if the on-disk bundle no longer matches
// it (GUI edits, app rewrites beyond the volatile Pages.Current pointer),
// the emitter refuses to overwrite without force — generated profiles are
// code-owned, but clobbering someone's manual work should be a decision,
// not an accident.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { imageSourcePath } from "./action-images";
import { detectDevice, type DeviceBlock } from "./device";
import { actionUuid, pageUuid, profileUuid } from "./ids";
import type { ActionEntry, ProfileSpec } from "./model";
import { validateSpec } from "./model";

const SIDECAR = ".generated.json";

// Every file in a bundle is either a JSON manifest or a raw image copied in
// from imgs/ (see action-images.ts) — hashed and written differently.
type FileEntry = { kind: "json"; data: unknown } | { kind: "binary"; data: Buffer };

interface Sidecar {
    generator: string;
    specId: string;
    contentHash: string;
}

export interface EmitResult {
    id: string;
    dir: string;
    status: "created" | "updated" | "unchanged" | "refused";
    reason?: string;
}

// ─── Canonical hashing ───────────────────────────────────────────────────────
// Hash parsed JSON with sorted keys (not raw bytes — the app may reserialize
// with different formatting) and with the volatile Pages.Current pointer
// stripped (the app rewrites it to the last-viewed page at runtime).

function stableStringify(value: unknown): string {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value !== null && typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>)
            .filter(([, v]) => v !== undefined)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`);
        return `{${entries.join(",")}}`;
    }
    return JSON.stringify(value);
}

function canonicalizeJson(relPath: string, json: unknown): string {
    if (relPath === "manifest.json") {
        const clone = JSON.parse(JSON.stringify(json)) as {
            Pages?: { Current?: string };
        };
        if (clone.Pages) delete clone.Pages.Current;
        return stableStringify(clone);
    }
    return stableStringify(json);
}

function hashFiles(files: ReadonlyMap<string, FileEntry>): string {
    const hash = createHash("sha256");
    for (const relPath of [...files.keys()].sort()) {
        const entry = files.get(relPath)!;
        hash.update(relPath);
        hash.update("\0");
        if (entry.kind === "json") hash.update(canonicalizeJson(relPath, entry.data));
        else hash.update(entry.data);
        hash.update("\0");
    }
    return hash.digest("hex");
}

function readExistingFiles(dir: string, relPaths: readonly string[]): Map<string, FileEntry> | null {
    const files = new Map<string, FileEntry>();
    for (const relPath of relPaths) {
        const full = join(dir, relPath);
        if (!existsSync(full)) return null;
        try {
            if (relPath.endsWith(".json")) {
                files.set(relPath, { kind: "json", data: JSON.parse(readFileSync(full, "utf8")) });
            } else {
                files.set(relPath, { kind: "binary", data: readFileSync(full) });
            }
        } catch {
            return null;
        }
    }
    return files;
}

// ─── Rendering ───────────────────────────────────────────────────────────────

function withActionIds(
    entry: ActionEntry,
    actionId: string,
    profileId: string,
    pageId: string,
    pos: string,
): Record<string, unknown> {
    // `icon` is a generator-only hint (see model.ts) — never written to disk.
    const { icon: _icon, ...diskEntry } = entry;
    const result: Record<string, unknown> = {
        ActionID: actionId,
        ...diskEntry,
    };
    if (entry.Actions) {
        result.Actions = entry.Actions.map((slot, slotIdx) => ({
            Actions: slot.Actions.map((step, stepIdx) => {
                const { icon: _stepIcon, ...diskStep } = step;
                return {
                    ActionID: actionUuid(profileId, pageId, pos, `${slotIdx}.${stepIdx}`),
                    ...diskStep,
                };
            }),
        }));
    }
    return result;
}

// Renders every file of the bundle as relPath → FileEntry (JSON manifest or
// binary PNG). Every top-level key gets an explicit States[].Image copied
// from imgs/ — see action-images.ts for why that's required, not optional.
export function renderProfile(spec: ProfileSpec, device: DeviceBlock): Map<string, FileEntry> {
    validateSpec(spec);

    // UUIDs are lowercase inside JSON but page DIRECTORY names are uppercase
    // — mirroring exactly how the app itself lays out real profiles.
    const pageUuids = spec.pages.map((p) => pageUuid(spec.id, p.id));
    const defaultUuid = pageUuid(spec.id, "__default");

    const files = new Map<string, FileEntry>();

    files.set("manifest.json", {
        kind: "json",
        data: {
            ...(spec.appIdentifier ? { AppIdentifier: spec.appIdentifier } : {}),
            Device: device,
            Name: spec.name,
            Pages: {
                Current: pageUuids[0],
                Default: defaultUuid,
                Pages: pageUuids,
            },
            Version: "3.0",
        },
    });

    spec.pages.forEach((page, i) => {
        const pageDir = pageUuids[i]!.toUpperCase();
        const actions: Record<string, unknown> = {};
        for (const { col, row, key } of page.keys) {
            const pos = `${col},${row}`;
            const actionId = actionUuid(spec.id, page.id, pos);
            const imageFile = `${actionId.replace(/-/g, "")}.png`;
            files.set(`Profiles/${pageDir}/Images/${imageFile}`, {
                kind: "binary",
                data: readFileSync(imageSourcePath(key.icon ?? key.UUID)),
            });

            const keyWithImage: ActionEntry = {
                ...key,
                States: [{ ...(key.States[0] ?? {}), Image: `Images/${imageFile}` }, ...key.States.slice(1)],
            };
            actions[pos] = withActionIds(keyWithImage, actionId, spec.id, page.id, pos);
        }
        files.set(`Profiles/${pageDir}/manifest.json`, {
            kind: "json",
            data: { Controllers: [{ Actions: actions, Type: "Keypad" }], Icon: "", Name: "" },
        });
    });

    // The separate empty Default page — Current and Default must differ or
    // the app logs a "duplicate" warning at startup.
    files.set(`Profiles/${defaultUuid.toUpperCase()}/manifest.json`, {
        kind: "json",
        data: { Controllers: [{ Actions: null, Type: "Keypad" }], Icon: "", Name: "" },
    });

    return files;
}

export function profileDirName(spec: ProfileSpec): string {
    return `${(spec.uuid ?? profileUuid(spec.id)).toUpperCase()}.sdProfile`;
}

// ─── Emit ────────────────────────────────────────────────────────────────────

export function emitProfile(
    spec: ProfileSpec,
    outDir: string,
    opts: { force?: boolean; device?: DeviceBlock } = {},
): EmitResult {
    const device = opts.device ?? detectDevice();
    const files = renderProfile(spec, device);
    const newHash = hashFiles(files);
    const dir = join(outDir, profileDirName(spec));

    if (existsSync(dir)) {
        const sidecarPath = join(dir, SIDECAR);
        if (!existsSync(sidecarPath)) {
            if (!opts.force) {
                return {
                    id: spec.id,
                    dir,
                    status: "refused",
                    reason: "directory exists but has no generator sidecar (built by hand or via the GUI) — rerun with --force to adopt it",
                };
            }
        } else {
            const sidecar = JSON.parse(readFileSync(sidecarPath, "utf8")) as Sidecar;
            const existing = readExistingFiles(dir, [...files.keys()]);
            const existingHash = existing ? hashFiles(existing) : null;

            if (existingHash === newHash) {
                return { id: spec.id, dir, status: "unchanged" };
            }
            // On-disk content drifted from what we last generated → edited
            // outside the generator. (Matching sidecar.contentHash means the
            // only difference is our spec changing — safe to overwrite.)
            if (existingHash !== sidecar.contentHash && !opts.force) {
                return {
                    id: spec.id,
                    dir,
                    status: "refused",
                    reason: "bundle was modified outside the generator since last emit — rerun with --force to overwrite",
                };
            }
        }
    }

    const created = !existsSync(dir);
    // Full replace: stale pages from a previous spec shouldn't linger.
    rmSync(dir, { recursive: true, force: true });
    for (const [relPath, entry] of files) {
        const full = join(dir, relPath);
        mkdirSync(join(full, ".."), { recursive: true });
        writeFileSync(full, entry.kind === "json" ? JSON.stringify(entry.data) : entry.data);
    }
    const sidecar: Sidecar = {
        generator: "stream-deck-plugin src/profiles",
        specId: spec.id,
        contentHash: newHash,
    };
    writeFileSync(join(dir, SIDECAR), JSON.stringify(sidecar, null, 2));

    return { id: spec.id, dir, status: created ? "created" : "updated" };
}
