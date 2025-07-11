import { defineConfig } from "tsup";

export default defineConfig({
  entry: { navi: "src/index.ts" },
  format: ["iife"],
  globalName: "NaviLoader",
  outDir: "dist",
  clean: true,
  minify: true,
  sourcemap: false,
  target: "es2018",
  outExtension() {
    return {
      js: ".js",
    };
  },
  banner: {
    js: `// Navi SDK Loader v1.0.0-poc - Built with Turbo + tsup`,
  },
  esbuildOptions(options) {
    options.outbase = "./";
    // Set the global name to be accessible as window.Navi
    options.globalName = "NaviLoader";
  },
  onSuccess: 'echo "✅ Navi loader built successfully"',
});
