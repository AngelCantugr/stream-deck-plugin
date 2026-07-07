import streamDeck, {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";
import { findSession, TMUX_SESSIONS } from "../config/dev-workflow.config";
import { runInTerminal } from "../utils/shell";

type TmuxSessionSettings = {
    configId?: string;
};

@action({ UUID: "com.angelcantugr.devworkflow.tmux-session" })
export class TmuxSession extends SingletonAction<TmuxSessionSettings> {
    override async onWillAppear(ev: WillAppearEvent<TmuxSessionSettings>): Promise<void> {
        const config = findSession(ev.payload.settings.configId ?? "");
        await ev.action.setTitle(config?.label ?? "tmux");
    }

    override async onKeyDown(ev: KeyDownEvent<TmuxSessionSettings>): Promise<void> {
        const config = findSession(ev.payload.settings.configId ?? "");
        if (!config) {
            await ev.action.showAlert();
            return;
        }

        try {
            const name = config.sessionName.replace(/"/g, '\\"');
            const cmd = config.createIfMissing
                ? `tmux attach-session -t "${name}" 2>/dev/null || tmux new-session -s "${name}"`
                : `tmux attach-session -t "${name}"`;
            await runInTerminal(cmd);
            await ev.action.showOk();
        } catch (err) {
            streamDeck.logger.error(`Failed to attach tmux session ${config.sessionName}`, err);
            await ev.action.showAlert();
        }
    }

    override async onPropertyInspectorDidAppear(): Promise<void> {
        await streamDeck.ui.sendToPropertyInspector({
            type: "sessionList",
            sessions: TMUX_SESSIONS.map((s) => ({
                id: s.id,
                label: s.label,
                sessionName: s.sessionName,
            })),
        });
    }
}
