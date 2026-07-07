import streamDeck, {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";
import { findScript, SCRIPTS } from "../config/dev-workflow.config";
import { runScript } from "../utils/shell";

type ScriptRunnerSettings = {
    configId?: string;
};

@action({ UUID: "com.angelcantugr.devworkflow.script-runner" })
export class ScriptRunner extends SingletonAction<ScriptRunnerSettings> {
    override async onWillAppear(ev: WillAppearEvent<ScriptRunnerSettings>): Promise<void> {
        const config = findScript(ev.payload.settings.configId ?? "");
        await ev.action.setTitle(config?.label ?? "script");
    }

    override async onKeyDown(ev: KeyDownEvent<ScriptRunnerSettings>): Promise<void> {
        const config = findScript(ev.payload.settings.configId ?? "");
        if (!config) {
            await ev.action.showAlert();
            return;
        }

        try {
            await runScript(config.scriptName, config.interpreter);
            await ev.action.showOk();
        } catch (err) {
            streamDeck.logger.error(`Failed to run script ${config.scriptName}`, err);
            await ev.action.showAlert();
        }
    }

    override async onPropertyInspectorDidAppear(): Promise<void> {
        await streamDeck.ui.sendToPropertyInspector({
            type: "scriptList",
            scripts: SCRIPTS.map((s) => ({
                id: s.id,
                label: s.label,
                scriptName: s.scriptName,
                interpreter: s.interpreter,
            })),
        });
    }
}
