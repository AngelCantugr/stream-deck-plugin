import streamDeck from "@elgato/streamdeck";
import { AppLauncher } from "./actions/app-launcher";
import { CmuxWorkflow } from "./actions/cmux-workflow";
import { ScriptRunner } from "./actions/script-runner";
import { ShellCommand } from "./actions/shell-command";
import { StatusTile } from "./actions/status-tile";
import { TmuxSession } from "./actions/tmux-session";
import { statusPoller } from "./status/poller";

streamDeck.actions.registerAction(new AppLauncher());
streamDeck.actions.registerAction(new ShellCommand());
streamDeck.actions.registerAction(new TmuxSession());
streamDeck.actions.registerAction(new ScriptRunner());
streamDeck.actions.registerAction(new StatusTile());
streamDeck.actions.registerAction(new CmuxWorkflow());

// Push doorbell for status tiles. External scripts (agent-result-write,
// notify-input-needed, git hooks, …) force an instant repaint with:
//   open "streamdeck://plugins/message/com.angelcantugr.devworkflow/refresh?source=<id>&streamdeck=hidden"
// Omitting ?source refreshes every active source. Polling stays on as a
// lazy safety net, so a missed doorbell only delays — never loses — an update.
streamDeck.system.onDidReceiveDeepLink((ev) => {
    const path = ev.url.path.replace(/^\//, "");
    if (path !== "refresh") {
        streamDeck.logger.warn(`Ignoring unknown deep link path: ${ev.url.path}`);
        return;
    }
    const source = new URLSearchParams(ev.url.query ?? "").get("source") ?? undefined;
    void statusPoller.refresh(source);
});

await streamDeck.connect();
