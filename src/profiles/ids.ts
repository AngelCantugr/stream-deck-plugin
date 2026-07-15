// Deterministic UUIDs for generated profiles.
//
// Every identity in an emitted .sdProfile (profile dir, page dirs, per-key
// ActionIDs) is a UUIDv5 of a stable name — same spec in, same bytes out.
// That determinism is what makes regeneration UPDATE a profile in place
// (directory name = identity to the Stream Deck app) instead of installing
// a duplicate, and makes generator output diffable.

import { createHash } from "node:crypto";

// Project-private namespace — never change this, or every generated profile
// gets a new identity and re-installs as a duplicate.
const NAMESPACE = "c2fb7a10-3e4d-4b6a-9d2e-5f8a1b0c7d43";

export function uuidv5(name: string): string {
    const ns = Buffer.from(NAMESPACE.replace(/-/g, ""), "hex");
    const hash = createHash("sha1").update(ns).update(name, "utf8").digest();
    hash[6] = (hash[6] & 0x0f) | 0x50; // version 5
    hash[8] = (hash[8] & 0x3f) | 0x80; // RFC 4122 variant
    const hex = hash.subarray(0, 16).toString("hex");
    // Lowercase, matching how the app serializes UUIDs inside profile JSON
    // and its own preferences. (Directory names are uppercased separately by
    // the emitter — that's the on-disk convention real profiles use.)
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32),
    ].join("-");
}

export const profileUuid = (profileId: string): string => uuidv5(`profile:${profileId}`);
export const pageUuid = (profileId: string, pageId: string): string =>
    uuidv5(`page:${profileId}:${pageId}`);
export const actionUuid = (profileId: string, pageId: string, position: string, step = ""): string =>
    uuidv5(`key:${profileId}:${pageId}:${position}${step ? `:${step}` : ""}`);
