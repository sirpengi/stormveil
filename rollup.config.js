import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import replace from "rollup-plugin-replace";
import typescript from "rollup-plugin-typescript";

export default {
    input: "src/main.ts",
    output: {
        file: "web/dist/application.js",
        format: "iife"
    },
    plugins: [
        resolve(),
        typescript(),
        commonjs(),
        replace({
            "process.env.NODE_ENV": JSON.stringify("production")
        })
    ]
}
