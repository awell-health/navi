import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Map the package root to the source directory so subpath imports work in tests
      "@awell-health/navi-core": path.resolve(
        __dirname,
        "../../packages/navi-core/src"
      ),
      // Explicit subpath alias for helpers for clarity (optional when root maps to src)
      "@awell-health/navi-core/helpers": path.resolve(
        __dirname,
        "../../packages/navi-core/src/helpers.ts"
      ),
    },
  },
});
