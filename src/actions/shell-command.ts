import streamDeck, {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";
import { findCommand, SHELL_COMMANDS } from "../config/dev-workflow.config";
import { exec, runInTerminal } from "../utils/shell";
import { withStatus } from "../utils/cmux";

type ShellCommandSettings = {
    configId?: string;
};

@action({ UUID: "com.angelcantugr.devworkflow.shell-command" })
export class ShellCommand extends SingletonAction<ShellCommandSettings> {
    override async onWillAppear(ev: WillAppearEvent<ShellCommandSettings>): Promise<void> {
        const config = findCommand(ev.payload.settings.configId ?? "");
        await ev.action.setTitle(config?.label ?? "cmd");
    }

    override async onKeyDown(ev: KeyDownEvent<ShellCommandSettings>): Promise<void> {
        const config = findCommand(ev.payload.settings.configId ?? "");
        if (!config) {
            await ev.action.showAlert();
            return;
        }

        try {
            await withStatus(config.cmuxStatus, async () => {
                if (config.runIn === "terminal") {
                    await runInTerminal(config.command);
                } else {
                    await exec(config.command);
                }
            });
            await ev.action.showOk();
        } catch (err) {
            streamDeck.logger.error(`Failed to run command ${config.id}`, err);
            await ev.action.showAlert();
        }
    }

    override async onPropertyInspectorDidAppear(): Promise<void> {
        await streamDeck.ui.sendToPropertyInspector({
            type: "commandList",
            commands: SHELL_COMMANDS.map((c) => ({
                id: c.id,
                label: c.label,
                command: c.command,
                runIn: c.runIn,
            })),
        });
    }
}
