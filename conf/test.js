import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";

export default {
    input: "src/test.ts",
    output: {
        file: "web/dist/test.bundle.js",
        format: "iife"
    },
    plugins: [
        builtins(),
        commonjs(),
        globals({ dirname: false }),
        resolve({ preferBuiltins: false }),
        typescript(),
    ]
}
