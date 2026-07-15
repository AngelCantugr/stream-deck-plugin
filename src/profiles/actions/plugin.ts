// Builders for placing THIS plugin's actions (and useful third-party plugin
// actions) on generated profile keys.
//
// Confirmed working: a hand-authored profile can reference a plugin action
// UUID with Settings, and the plugin reads them via ev.payload.settings —
// the live Claude Desktop profile already does this (see
// docs/profile-authoring-reference.md §4).
//
// config-id arguments are validated at generation time against
// dev-workflow.config.ts, so a typo fails `npm run profiles` with a clear
// error instead of producing a dead key.

import {
    findApp,
    findCommand,
    findScript,
    findSession,
    findStatusSource,
} from "../../config/dev-workflow.config";
import type { ActionEntry, IconCategory } from "../model";

const PLUGIN_VERSION = "1.0.0.0";

function pluginEntry(
    name: string,
    actionUuid: string,
    settings: Record<string, unknown>,
    title?: string,
    icon?: IconCategory,
): ActionEntry {
    return {
        LinkedTitle: true,
        Name: name,
        Plugin: { Name: name, UUID: actionUuid, Version: PLUGIN_VERSION },
        Resources: null,
        Settings: settings,
        State: 0,
        States: [{ Title: title ?? "" }],
        UUID: actionUuid,
        icon,
    };
}

export function appLauncher(configId: string, title?: string): ActionEntry {
    const config = findApp(configId);
    if (!config) throw new Error(`appLauncher: unknown configId "${configId}"`);
    return pluginEntry(
        "App Launcher",
        "com.angelcantugr.devworkflow.app-launcher",
        { configId },
        title ?? config.label,
    );
}

export function shellCommand(configId: string, title?: string): ActionEntry {
    const config = findCommand(configId);
    if (!config) throw new Error(`shellCommand: unknown configId "${configId}"`);
    return pluginEntry(
        "Shell Command",
        "com.angelcantugr.devworkflow.shell-command",
        { configId },
        title ?? config.label,
    );
}

export function tmuxSession(configId: string, title?: string): ActionEntry {
    const config = findSession(configId);
    if (!config) throw new Error(`tmuxSession: unknown configId "${configId}"`);
    return pluginEntry(
        "tmux Session",
        "com.angelcantugr.devworkflow.tmux-session",
        { configId },
        title ?? config.label,
    );
}

export function scriptRunner(configId: string, title?: string, icon?: IconCategory): ActionEntry {
    const config = findScript(configId);
    if (!config) throw new Error(`scriptRunner: unknown configId "${configId}"`);
    return pluginEntry(
        "Script Runner",
        "com.angelcantugr.devworkflow.script-runner",
        { configId },
        title ?? config.label,
        icon,
    );
}

export function statusTile(sourceId: string): ActionEntry {
    const config = findStatusSource(sourceId);
    if (!config) throw new Error(`statusTile: unknown sourceId "${sourceId}"`);
    // No title — the tile's SVG carries title + value.
    return pluginEntry("Status Tile", "com.angelcantugr.devworkflow.status-tile", { sourceId });
}

// Mac Automation's inline shell action (third-party, installed). Trade-off
// vs Script Runner: the command lives inside the profile blob rather than
// in git-tracked config — use for profile-specific one-liners only.
export function macAutoShell(command: string, title?: string): ActionEntry {
    return {
        LinkedTitle: true,
        Name: "Run Shell Script",
        Plugin: { Name: "Mac Automation", UUID: "com.thoughtasylum.macauto.runshell", Version: "1.0" },
        Resources: null,
        Settings: { shellCommand: command },
        State: 0,
        States: [{ Title: title ?? "" }],
        UUID: "com.thoughtasylum.macauto.runshell",
    };
}
