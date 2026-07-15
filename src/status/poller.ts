// Poll scheduler for Status Tile sources.
//
// One timer per source, and only while that source has at least one visible
// key instance (tracked via onWillAppear/onWillDisappear) — a SingletonAction
// is one class instance but many visible keys across profiles/pages, so the
// polling cost scales with what's on screen, not with what's configured.
// External scripts can force an immediate re-poll via the streamdeck://
// deep link handled in plugin.ts.

import streamDeck from "@elgato/streamdeck";
import type { StatusSourceConfig } from "../config/dev-workflow.config";
import { parseStatusPayload, renderErrorTile, renderTile } from "../render/tile";
import { runScript } from "../utils/shell";

// A status script that hangs must never wedge the plugin's event loop or
// pile up overlapping executions — hard-kill after this long.
const POLL_TIMEOUT_MS = 5000;

interface TileTarget {
    setImage(image?: string): Promise<void>;
}

interface SourceEntry {
    config: StatusSourceConfig;
    targets: Map<string, TileTarget>;
    timer?: NodeJS.Timeout;
    lastImage?: string;
    polling?: boolean;
}

const log = streamDeck.logger.createScope("StatusPoller");

class StatusPoller {
    private readonly sources = new Map<string, SourceEntry>();

    register(config: StatusSourceConfig, targetId: string, target: TileTarget): void {
        let entry = this.sources.get(config.id);
        if (!entry) {
            entry = { config, targets: new Map() };
            this.sources.set(config.id, entry);
        }
        entry.targets.set(targetId, target);
        log.info(`register source=${config.id} target=${targetId} visible=${entry.targets.size}`);

        if (!entry.timer) {
            entry.timer = setInterval(() => void this.poll(config.id), config.intervalSec * 1000);
        }
        // Paint the new instance immediately: reuse the last result if we have
        // one, and kick a fresh poll either way.
        if (entry.lastImage) void target.setImage(entry.lastImage).catch(() => undefined);
        void this.poll(config.id);
    }

    // Removes a key instance from every source. Used on onWillDisappear and
    // before re-registering after a settings change (the old sourceId may
    // differ from what the event payload now reports).
    unregisterTarget(targetId: string): void {
        for (const entry of this.sources.values()) {
            entry.targets.delete(targetId);
            if (entry.targets.size === 0 && entry.timer) {
                clearInterval(entry.timer);
                entry.timer = undefined;
            }
        }
    }

    async refresh(sourceId?: string): Promise<void> {
        const ids = sourceId ? [sourceId] : [...this.sources.keys()];
        await Promise.all(ids.map((id) => this.poll(id)));
    }

    private async poll(sourceId: string): Promise<void> {
        const entry = this.sources.get(sourceId);
        if (!entry || entry.targets.size === 0 || entry.polling) return;

        entry.polling = true;
        let image: string;
        try {
            const { stdout } = await runScript(
                entry.config.scriptName,
                "bash",
                entry.config.args ?? [],
                { timeoutMs: POLL_TIMEOUT_MS },
            );
            const payload = parseStatusPayload(stdout);
            log.info(`poll source=${sourceId} → ${payload.state}:${payload.value}`);
            image = renderTile(payload);
        } catch (err) {
            log.error(`Status source ${sourceId} failed`, err);
            image = renderErrorTile(entry.config.label);
        } finally {
            entry.polling = false;
        }

        entry.lastImage = image;
        await Promise.all(
            [...entry.targets.values()].map((t) => t.setImage(image).catch(() => undefined)),
        );
    }
}

export const statusPoller = new StatusPoller();
