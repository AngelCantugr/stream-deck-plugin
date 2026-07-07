import { exec as nodeExec } from "child_process";
import { join } from "path";
import { promisify } from "util";

const execAsync = promisify(nodeExec);

export interface ExecResult {
    stdout: string;
    stderr: string;
}

// At runtime, Node.js starts from the .sdPlugin directory.
export const PLUGIN_DIR = process.cwd();

export async function exec(command: string): Promise<ExecResult> {
    return execAsync(command);
}

export async function openAppByName(appName: string): Promise<ExecResult> {
    return execAsync(`open -a "${appName.replace(/"/g, '\\"')}"`);
}

export async function openAppById(bundleId: string): Promise<ExecResult> {
    return execAsync(`open -b "${bundleId.replace(/"/g, '\\"')}"`);
}

export async function runInTerminal(command: string): Promise<void> {
    // Escape for AppleScript string literal
    const safe = command.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    await execAsync(
        `osascript -e 'tell application "Terminal" to do script "${safe}"' -e 'tell application "Terminal" to activate'`
    );
}

export async function runScript(
    scriptName: string,
    interpreter: "bash" | "python3",
    args: readonly string[] = []
): Promise<ExecResult> {
    const scriptPath = join(PLUGIN_DIR, "scripts", scriptName);
    const safeArgs = args.map((a) => `"${a.replace(/"/g, '\\"')}"`).join(" ");
    return execAsync(`${interpreter} "${scriptPath}" ${safeArgs}`.trimEnd());
}
