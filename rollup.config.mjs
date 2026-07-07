import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { execSync } from "child_process";

const PLUGIN_UUID = "com.angelcantugr.devworkflow";

/** @type {import('rollup').RollupOptions} */
export default {
    input: "src/plugin.ts",
    output: {
        file: `${PLUGIN_UUID}.sdPlugin/bin/plugin.js`,
        format: "es",
        sourcemap: true,
    },
    plugins: [
        resolve({ preferBuiltins: true }),
        commonjs(),
        typescript({
            declaration: false,
            declarationMap: false,
        }),
        {
            name: "restart-stream-deck",
            writeBundle() {
                try {
                    execSync(`streamdeck restart ${PLUGIN_UUID}`, { stdio: "inherit" });
                } catch {
                    // Plugin may not be linked yet — ignore during initial setup
                }
            },
        },
    ],
    // Node.js built-ins must be external; @elgato/streamdeck is bundled
    external: [
        "child_process", "util", "path", "fs", "url",
        "stream", "events", "net", "http", "https",
        "os", "crypto", "zlib", "buffer", "assert",
    ],
};
