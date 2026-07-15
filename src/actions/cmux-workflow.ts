import streamDeck, {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";
import { CMUX_WORKFLOWS, findCmuxWorkflow } from "../config/dev-workflow.config";
import { dispatchToWorkspace, runWorktreeLaunch } from "../utils/cmux";

type CmuxWorkflowSettings = {
    configId?: string;
};

@action({ UUID: "com.angelcantugr.devworkflow.cmux-workflow" })
export class CmuxWorkflow extends SingletonAction<CmuxWorkflowSettings> {
    override async onWillAppear(ev: WillAppearEvent<CmuxWorkflowSettings>): Promise<void> {
        const config = findCmuxWorkflow(ev.payload.settings.configId ?? "");
        await ev.action.setTitle(config?.label ?? "cmux");
    }

    override async onKeyDown(ev: KeyDownEvent<CmuxWorkflowSettings>): Promise<void> {
        const config = findCmuxWorkflow(ev.payload.settings.configId ?? "");
        if (!config) {
            await ev.action.showAlert();
            return;
        }

        try {
            if (config.kind === "skill") {
                await dispatchToWorkspace(config.workspace, config.skill);
            } else {
                await runWorktreeLaunch(config.base, config.agent);
            }
            await ev.action.showOk();
        } catch (err) {
            streamDeck.logger.error(`Failed to run cmux workflow ${config.id}`, err);
            await ev.action.showAlert();
        }
    }

    override async onPropertyInspectorDidAppear(): Promise<void> {
        await streamDeck.ui.sendToPropertyInspector({
            type: "workflowList",
            workflows: CMUX_WORKFLOWS.map((w) => ({
                id: w.id,
                label: w.label,
                summary: w.kind === "skill" ? `${w.workspace} → ${w.skill}` : `worktree ${w.base}/${w.agent}`,
            })),
        });
    }
}
