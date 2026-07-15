import streamDeck, {
    action,
    DidReceiveSettingsEvent,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
    WillDisappearEvent,
} from "@elgato/streamdeck";
import { findStatusSource, STATUS_SOURCES } from "../config/dev-workflow.config";
import { statusPoller } from "../status/poller";
import { runScript } from "../utils/shell";

type StatusTileSettings = {
    sourceId?: string;
};

@action({ UUID: "com.angelcantugr.devworkflow.status-tile" })
export class StatusTile extends SingletonAction<StatusTileSettings> {
    override async onWillAppear(ev: WillAppearEvent<StatusTileSettings>): Promise<void> {
        const config = findStatusSource(ev.payload.settings.sourceId ?? "");
        if (!config) {
            await ev.action.setTitle("status");
            return;
        }
        // The tile image carries title + value; a key title would overlay it.
        await ev.action.setTitle("");
        statusPoller.register(config, ev.action.id, ev.action);
    }

    override async onWillDisappear(ev: WillDisappearEvent<StatusTileSettings>): Promise<void> {
        statusPoller.unregisterTarget(ev.action.id);
    }

    override async onDidReceiveSettings(
        ev: DidReceiveSettingsEvent<StatusTileSettings>,
    ): Promise<void> {
        // Source may have changed in the PI — drop the old registration first.
        statusPoller.unregisterTarget(ev.action.id);
        const config = findStatusSource(ev.payload.settings.sourceId ?? "");
        if (!config) {
            await ev.action.setTitle("status");
            return;
        }
        await ev.action.setTitle("");
        statusPoller.register(config, ev.action.id, ev.action);
    }

    override async onKeyDown(ev: KeyDownEvent<StatusTileSettings>): Promise<void> {
        const config = findStatusSource(ev.payload.settings.sourceId ?? "");
        if (!config) {
            await ev.action.showAlert();
            return;
        }

        try {
            if (config.pressScript) {
                await runScript(
                    config.pressScript.scriptName,
                    "bash",
                    config.pressScript.args ?? [],
                );
            }
            await statusPoller.refresh(config.id);
        } catch (err) {
            streamDeck.logger.error(`Status tile press failed for ${config.id}`, err);
            await ev.action.showAlert();
        }
    }

    override async onPropertyInspectorDidAppear(): Promise<void> {
        await streamDeck.ui.sendToPropertyInspector({
            type: "statusSourceList",
            sources: STATUS_SOURCES.map((s) => ({
                id: s.id,
                label: s.label,
                scriptName: s.scriptName,
                intervalSec: s.intervalSec,
            })),
        });
    }
}
