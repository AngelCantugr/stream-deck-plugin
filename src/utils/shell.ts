import { exec as nodeExec, execFile as nodeExecFile } from "child_process";
import { join } from "path";
import { promisify } from "util";

const execAsync = promisify(nodeExec);
const execFileAsync = promisify(nodeExecFile);

export interface ExecResult {
    stdout: string;
    stderr: string;
}

// At runtime, Node.js starts from the .sdPlugin directory.
export const PLUGIN_DIR = process.cwd();

// WARNING: passes `command` directly to a shell — unsafe for any dynamic or
// user-supplied input. Only call with compile-time-constant strings from
// dev-workflow.config.ts (e.g. SHELL_COMMANDS entries).
export async function exec(command: string): Promise<ExecResult> {
    return execAsync(command);
}

export async function openAppByName(appName: string): Promise<ExecResult> {
    return execFileAsync("open", ["-a", appName]);
}

export async function openAppById(bundleId: string): Promise<ExecResult> {
    return execFileAsync("open", ["-b", bundleId]);
}

export async function runInTerminal(command: string): Promise<void> {
    // Escape for AppleScript string literal — still needed since the command
    // value becomes part of an AppleScript string passed as a single -e arg.
    const safe = command.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    await execFileAsync("osascript", [
        "-e", `tell application "Terminal" to do script "${safe}"`,
        "-e", `tell application "Terminal" to activate`,
    ]);
}

export async function runScript(
    scriptName: string,
    interpreter: "bash" | "python3",
    args: readonly string[] = []
): Promise<ExecResult> {
    const scriptPath = join(PLUGIN_DIR, "scripts", scriptName);
    return execFileAsync(interpreter, [scriptPath, ...args]);
}
