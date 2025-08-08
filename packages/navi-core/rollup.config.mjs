import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        exports: "named",
      },
      {
        file: "dist/index.esm.js",
        format: "esm",
      },
    ],
    plugins: [
      resolve(),
      typescript({
        tsconfig: "./tsconfig.build.json",
        declaration: true,
        declarationDir: "dist",
      }),
    ],
    external: ["graphql", "jose", "zod"],
  },
  {
    input: "src/helpers.ts",
    output: [
      {
        file: "dist/helpers.js",
        format: "cjs",
      },
      {
        file: "dist/helpers.esm.js",
        format: "esm",
      },
    ],
    plugins: [
      resolve(),
      typescript({
        tsconfig: "./tsconfig.build.json",
        declaration: true,
        declarationDir: "dist",
      }),
    ],
  },
];
