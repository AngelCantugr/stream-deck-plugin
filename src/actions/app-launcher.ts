import streamDeck, {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";
import { APP_LAUNCHERS, findApp } from "../config/dev-workflow.config";
import { openAppById, openAppByName, runScript } from "../utils/shell";

type AppLauncherSettings = {
    configId?: string;
};

@action({ UUID: "com.angelcantugr.devworkflow.app-launcher" })
export class AppLauncher extends SingletonAction<AppLauncherSettings> {
    override async onWillAppear(ev: WillAppearEvent<AppLauncherSettings>): Promise<void> {
        const config = findApp(ev.payload.settings.configId ?? "");
        await ev.action.setTitle(config?.label ?? "App");
    }

    override async onKeyDown(ev: KeyDownEvent<AppLauncherSettings>): Promise<void> {
        const config = findApp(ev.payload.settings.configId ?? "");
        if (!config) {
            await ev.action.showAlert();
            return;
        }

        try {
            const { launch } = config;
            if (launch.type === "bundleId") {
                await openAppById(launch.value);
            } else if (launch.type === "appName") {
                await openAppByName(launch.value);
            } else {
                await runScript(launch.value, "bash");
            }
            await ev.action.showOk();
        } catch (err) {
            streamDeck.logger.error(`Failed to launch ${config.id}`, err);
            await ev.action.showAlert();
        }
    }

    // Send the configured app list to the property inspector when it opens
    override async onPropertyInspectorDidAppear(): Promise<void> {
        await streamDeck.ui.sendToPropertyInspector({
            type: "appList",
            apps: APP_LAUNCHERS.map((a) => ({ id: a.id, label: a.label })),
        });
    }
}
