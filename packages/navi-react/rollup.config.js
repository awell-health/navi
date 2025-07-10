import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

export default [
  // CommonJS build
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "cjs",
      exports: "named",
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "dist",
        exclude: ["**/*.test.ts", "**/*.test.tsx"],
        jsx: "react-jsx",
      }),
    ],
    external: ["react", "react-dom"],
  },
  // ESM build
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.esm.js",
      format: "esm",
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        declarationDir: null,
        exclude: ["**/*.test.ts", "**/*.test.tsx"],
        jsx: "react-jsx",
      }),
    ],
    external: ["react", "react-dom"],
  },
];
