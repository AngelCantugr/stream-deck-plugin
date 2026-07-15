// Device block detection.
//
// Every profile for the same physical Stream Deck carries an identical
// Device block ({Model, UUID} identifying the hardware). Read it from any
// existing profile on this machine rather than hardcoding — with a fallback
// to the values observed when this generator was built.

import { readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface DeviceBlock {
    Model: string;
    UUID: string;
}

export const PROFILES_V3_DIR = join(
    homedir(),
    "Library/Application Support/com.elgato.StreamDeck/ProfilesV3",
);

const FALLBACK_DEVICE: DeviceBlock = {
    Model: "20GAT9901",
    UUID: "@(1)[4057/108/CL37L2A00421]",
};

export function detectDevice(profilesDir: string = PROFILES_V3_DIR): DeviceBlock {
    let entries: string[];
    try {
        entries = readdirSync(profilesDir).filter((e) => e.endsWith(".sdProfile"));
    } catch {
        return FALLBACK_DEVICE;
    }

    for (const entry of entries) {
        try {
            const manifest = JSON.parse(
                readFileSync(join(profilesDir, entry, "manifest.json"), "utf8"),
            ) as { Device?: DeviceBlock };
            if (manifest.Device?.Model && manifest.Device?.UUID) return manifest.Device;
        } catch {
            continue;
        }
    }
    return FALLBACK_DEVICE;
}
