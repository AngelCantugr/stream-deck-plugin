// CLI: emit generated profiles into ProfilesV3 (or a scratch dir).
//
//   npm run profiles                        write all profiles (no restart)
//   npm run profiles -- --only ghostty      write a subset
//   npm run profiles -- --out /tmp/x        emit somewhere else for inspection
//   npm run profiles -- --force             overwrite adopted/GUI-edited bundles
//   npm run profiles -- --restart           quit Stream Deck, write, relaunch, scan log
//   npm run profiles -- --bundle <id>       zip a profile into the .sdPlugin as
//                                           <Name>.streamDeckProfile (build artifact)
//
// The Stream Deck app only reads ProfilesV3 at startup (no live watch), so
// plain writes take effect on the NEXT app launch; --restart forces it now.
// Writing happens while the app is stopped so it can't flush stale
// in-memory profile state over fresh files at quit time.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { detectDevice, PROFILES_V3_DIR } from "./device";
import { ALL_PROFILES } from "./definitions/index";
import { emitProfile, profileDirName, type EmitResult } from "./emit";

const STREAM_DECK_LOG = join(homedir(), "Library/Logs/ElgatoStreamDeck/StreamDeck.log");
// Runs via `npm run profiles`, so cwd is the repo root.
const SDPLUGIN_DIR = join(process.cwd(), "com.angelcantugr.devworkflow.sdPlugin");

interface CliArgs {
    out: string;
    only?: string[];
    force: boolean;
    restart: boolean;
    bundle?: string;
    list: boolean;
}

function parseArgs(argv: string[]): CliArgs {
    const args: CliArgs = { out: PROFILES_V3_DIR, force: false, restart: false, list: false };
    for (let i = 0; i < argv.length; i++) {
        switch (argv[i]) {
            case "--out": args.out = argv[++i]!; break;
            case "--only": args.only = argv[++i]!.split(","); break;
            case "--force": args.force = true; break;
            case "--restart": args.restart = true; break;
            case "--bundle": args.bundle = argv[++i]!; break;
            case "--list": args.list = true; break;
            default: throw new Error(`unknown argument: ${argv[i]}`);
        }
    }
    return args;
}

function sh(cmd: string, cmdArgs: string[], opts: { cwd?: string; ignoreError?: boolean } = {}): string {
    try {
        return execFileSync(cmd, cmdArgs, { encoding: "utf8", cwd: opts.cwd });
    } catch (err) {
        if (opts.ignoreError) return "";
        throw err;
    }
}

function isStreamDeckRunning(): boolean {
    // AppleScript's process check avoids the false positives `pgrep -f` risks
    // matching against the app's own path string (an open terminal/editor tab).
    const out = sh("osascript", ["-e", 'application "Elgato Stream Deck" is running'], { ignoreError: true });
    return out.trim() === "true";
}

async function quitStreamDeck(): Promise<void> {
    // The osascript quit reliably reports "User canceled (-128)" even when it
    // worked — never trust the exit status, verify the process is gone.
    sh("osascript", ["-e", 'quit app "Elgato Stream Deck"'], { ignoreError: true });
    for (let i = 0; i < 20; i++) {
        if (!isStreamDeckRunning()) return;
        await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error("Stream Deck app did not quit within 10s — aborting before touching ProfilesV3");
}

function scanLog(profileNames: string[]): string[] {
    if (!existsSync(STREAM_DECK_LOG)) return [];
    const lines = readFileSync(STREAM_DECK_LOG, "utf8").split("\n").slice(-300);
    return lines.filter(
        (l) =>
            (l.includes(" war ") || l.includes(" err ")) &&
            profileNames.some((n) => l.toLowerCase().includes(n.toLowerCase())),
    );
}

function bundleProfile(specId: string): void {
    const spec = ALL_PROFILES.find((p) => p.id === specId);
    if (!spec) throw new Error(`--bundle: unknown profile id "${specId}"`);
    const dir = join(PROFILES_V3_DIR, profileDirName(spec));
    if (!existsSync(dir)) throw new Error(`--bundle: ${dir} does not exist — emit it first`);
    const out = join(SDPLUGIN_DIR, `${spec.name.replace(/ \(generated\)$/, "")}.streamDeckProfile`);
    sh("rm", ["-f", out]);
    // Zip the bundle contents from inside the dir (-X strips resource forks);
    // exclude the generator sidecar — it's local bookkeeping, not profile data.
    sh("zip", ["-r", "-X", out, ".", "-x", ".generated.json"], { cwd: dir });
    console.log(`bundled → ${out}`);
}

async function main(): Promise<void> {
    const args = parseArgs(process.argv.slice(2));

    if (args.list) {
        for (const p of ALL_PROFILES) {
            console.log(`${p.id.padEnd(16)} ${profileDirName(p).padEnd(46)} ${p.appIdentifier ?? "(no auto-switch)"}`);
        }
        return;
    }

    if (args.bundle) {
        bundleProfile(args.bundle);
        return;
    }

    const specs = args.only
        ? ALL_PROFILES.filter((p) => args.only!.includes(p.id))
        : [...ALL_PROFILES];
    if (args.only && specs.length !== args.only.length) {
        const known = new Set(ALL_PROFILES.map((p) => p.id));
        throw new Error(`--only: unknown profile id(s): ${args.only.filter((o) => !known.has(o)).join(", ")}`);
    }

    const device = detectDevice();
    const writingLive = args.out === PROFILES_V3_DIR;

    if (args.restart && writingLive) {
        console.log("quitting Stream Deck app…");
        await quitStreamDeck();
    }

    const results: EmitResult[] = specs.map((spec) =>
        emitProfile(spec, args.out, { force: args.force, device }),
    );

    for (const r of results) {
        console.log(`${r.status.padEnd(10)} ${r.id.padEnd(16)} ${r.dir}${r.reason ? `\n           ↳ ${r.reason}` : ""}`);
    }

    if (args.restart && writingLive) {
        console.log("relaunching Stream Deck app…");
        sh("open", ["-a", "Elgato Stream Deck"]);
        await new Promise((r) => setTimeout(r, 4000));
        const warnings = scanLog(specs.map((s) => s.name));
        if (warnings.length > 0) {
            console.log("\nStreamDeck.log warnings/errors mentioning generated profiles:");
            for (const w of warnings) console.log(`  ${w}`);
        } else {
            console.log("StreamDeck.log: no warnings/errors mentioning generated profiles.");
        }
    } else if (writingLive && results.some((r) => r.status === "created" || r.status === "updated")) {
        console.log("\nNote: the Stream Deck app only reads ProfilesV3 at startup — restart it (or rerun with --restart) to pick these up.");
    }

    if (results.some((r) => r.status === "refused")) process.exitCode = 1;
}

main().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
