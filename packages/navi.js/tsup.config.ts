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
    js: `// Navi SDK v1.0.0 - Healthcare Activities Embed - https://navi.awell.com`,
  },
  esbuildOptions(options) {
    options.outbase = "./";
    options.globalName = "NaviLoader";

    // Production environment detection
    const isProduction = process.env.NODE_ENV === "production";

    options.define = {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
    };

    // Production optimizations
    if (isProduction) {
      options.treeShaking = true;
      options.minifyWhitespace = true;
      options.minifyIdentifiers = true;
      options.minifySyntax = true;
      options.drop = ["console", "debugger"];
    }
  },
  onSuccess: 'echo "✅ Navi CDN bundle built successfully"',
});
