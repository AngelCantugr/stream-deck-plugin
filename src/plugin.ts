import streamDeck from "@elgato/streamdeck";
import { AppLauncher } from "./actions/app-launcher";
import { CmuxWorkflow } from "./actions/cmux-workflow";
import { ScriptRunner } from "./actions/script-runner";
import { ShellCommand } from "./actions/shell-command";
import { TmuxSession } from "./actions/tmux-session";

streamDeck.actions.registerAction(new AppLauncher());
streamDeck.actions.registerAction(new ShellCommand());
streamDeck.actions.registerAction(new TmuxSession());
streamDeck.actions.registerAction(new ScriptRunner());
streamDeck.actions.registerAction(new CmuxWorkflow());

await streamDeck.connect();
