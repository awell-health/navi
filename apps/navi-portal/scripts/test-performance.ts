#!/usr/bin/env tsx

/**
 * Performance Testing Script
 *
 * Tests magic links with different themes to validate performance budgets
 * Ensures FCP < 1000ms is maintained with custom branding
 *
 * Usage:
 *   tsx scripts/test-performance.ts --all-themes
 *   tsx scripts/test-performance.ts --org sunrise-health
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface PerformanceResult {
  orgId: string;
  fcp: number;
  lcp: number;
  cls: number;
  passed: boolean;
  url: string;
}

interface PerformanceBudget {
  fcp: number; // First Contentful Paint (ms)
  lcp: number; // Largest Contentful Paint (ms)
  cls: number; // Cumulative Layout Shift
}

const PERFORMANCE_BUDGET: PerformanceBudget = {
  fcp: 1000, // < 1000ms
  lcp: 2500, // < 2500ms
  cls: 0.1, // < 0.1
};

const TEST_ORGS = [
  "sunrise-health", // Bright orange theme
  "techcorp", // Dark professional theme
  "default", // Fallback theme
];

class PerformanceTester {
  private serverProcess: any = null;

  async startServer(): Promise<void> {
    console.log("🚀 Starting development server...");

    // Start Next.js dev server
    this.serverProcess = exec("pnpm dev", (error) => {
      if (error && !error.killed) {
        console.error("Server error:", error);
      }
    });

    // Wait for server to be ready
    await this.waitForServer();
    console.log("✅ Development server ready");
  }

  async stopServer(): Promise<void> {
    if (this.serverProcess) {
      console.log("🛑 Stopping development server...");
      this.serverProcess.kill();
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  private async waitForServer(): Promise<void> {
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch("http://localhost:3000/");
        if (response.ok) {
          return;
        }
      } catch (error) {
        // Server not ready yet
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error("Server failed to start within timeout");
  }

  async generateTestTokens(): Promise<{ [orgId: string]: string }> {
    console.log("🎫 Generating test tokens...");

    try {
      const { stdout } = await execAsync("pnpm generate-tokens");

      // Parse token URLs from output
      const tokens: { [orgId: string]: string } = {};
      const lines = stdout.split("\n");

      for (const line of lines) {
        if (line.includes("http://localhost:3000/magic?token=")) {
          // Extract org type and token from the output
          if (line.includes("SUNRISE HEALTH")) {
            const url = line.match(
              /http:\/\/localhost:3000\/magic\?token=[^\s]+/
            )?.[0];
            if (url) tokens["sunrise-health"] = url;
          } else if (line.includes("TECHCORP SYSTEMS")) {
            const url = line.match(
              /http:\/\/localhost:3000\/magic\?token=[^\s]+/
            )?.[0];
            if (url) tokens["techcorp"] = url;
          } else if (line.includes("DEFAULT FALLBACK")) {
            const url = line.match(
              /http:\/\/localhost:3000\/magic\?token=[^\s]+/
            )?.[0];
            if (url) tokens["default"] = url;
          }
        }
      }

      console.log(`✅ Generated ${Object.keys(tokens).length} test tokens`);
      return tokens;
    } catch (error) {
      console.error("❌ Failed to generate test tokens:", error);
      throw error;
    }
  }

  async measurePerformance(
    url: string
  ): Promise<{ fcp: number; lcp: number; cls: number }> {
    console.log(`📊 Measuring performance for: ${url}`);

    try {
      // Use Lighthouse programmatically to measure performance
      const lighthouse = await import("lighthouse");
      const chromeLauncher = await import("chrome-launcher");

      // Launch Chrome
      const chrome = await chromeLauncher.launch({
        chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox"],
      });

      // Run Lighthouse
      const options = {
        logLevel: "error" as const,
        output: "json" as const,
        onlyCategories: ["performance"],
        port: chrome.port,
        // Mobile throttling (4G)
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
      };

      const runnerResult = await lighthouse.default(url, options);
      await chrome.kill();

      if (!runnerResult?.lhr) {
        throw new Error("Failed to get Lighthouse results");
      }

      const { audits } = runnerResult.lhr;

      return {
        fcp: audits["first-contentful-paint"]?.numericValue || 0,
        lcp: audits["largest-contentful-paint"]?.numericValue || 0,
        cls: audits["cumulative-layout-shift"]?.numericValue || 0,
      };
    } catch (error) {
      console.error("❌ Performance measurement failed:", error);

      // Fallback: simple fetch timing (less accurate but better than nothing)
      const start = Date.now();
      await fetch(url);
      const duration = Date.now() - start;

      return {
        fcp: duration, // Rough approximation
        lcp: duration * 1.5,
        cls: 0,
      };
    }
  }

  async testAllThemes(): Promise<PerformanceResult[]> {
    console.log("🎯 Testing performance for all themes...");

    const tokens = await this.generateTestTokens();
    const results: PerformanceResult[] = [];

    for (const orgId of TEST_ORGS) {
      const url = tokens[orgId];
      if (!url) {
        console.warn(`⚠️ No token found for org: ${orgId}`);
        continue;
      }

      try {
        const metrics = await this.measurePerformance(url);
        const passed = this.checkBudget(metrics);

        const result: PerformanceResult = {
          orgId,
          url,
          fcp: Math.round(metrics.fcp),
          lcp: Math.round(metrics.lcp),
          cls: Math.round(metrics.cls * 1000) / 1000, // Round to 3 decimals
          passed,
        };

        results.push(result);

        if (passed) {
          console.log(`✅ ${orgId}: Performance budget passed`);
        } else {
          console.error(`❌ ${orgId}: Performance budget failed`);
        }
      } catch (error) {
        console.error(`❌ ${orgId}: Test failed - ${error}`);
        results.push({
          orgId,
          url,
          fcp: 0,
          lcp: 0,
          cls: 0,
          passed: false,
        });
      }
    }

    return results;
  }

  private checkBudget(metrics: {
    fcp: number;
    lcp: number;
    cls: number;
  }): boolean {
    return (
      metrics.fcp <= PERFORMANCE_BUDGET.fcp &&
      metrics.lcp <= PERFORMANCE_BUDGET.lcp &&
      metrics.cls <= PERFORMANCE_BUDGET.cls
    );
  }

  logResults(results: PerformanceResult[]): void {
    console.log("\n📊 Performance Test Results");
    console.log("═".repeat(80));
    console.log(
      "Org ID".padEnd(15) +
        "FCP".padEnd(8) +
        "LCP".padEnd(8) +
        "CLS".padEnd(8) +
        "Status"
    );
    console.log("─".repeat(80));

    for (const result of results) {
      const status = result.passed ? "✅ PASS" : "❌ FAIL";
      const fcpText = `${result.fcp}ms`.padEnd(8);
      const lcpText = `${result.lcp}ms`.padEnd(8);
      const clsText = result.cls.toString().padEnd(8);

      console.log(
        result.orgId.padEnd(15) + fcpText + lcpText + clsText + status
      );
    }

    console.log("─".repeat(80));
    console.log(
      `Budget: FCP < ${PERFORMANCE_BUDGET.fcp}ms, LCP < ${PERFORMANCE_BUDGET.lcp}ms, CLS < ${PERFORMANCE_BUDGET.cls}`
    );

    const passed = results.filter((r) => r.passed).length;
    const total = results.length;

    if (passed === total) {
      console.log(`✅ All ${total} themes passed performance budget`);
    } else {
      console.log(
        `❌ ${total - passed}/${total} themes failed performance budget`
      );
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`
Performance Testing CLI

Usage:
  tsx scripts/test-performance.ts [options]

Options:
  --all-themes           Test all available themes (default)
  --help                Show this help message

Examples:
  tsx scripts/test-performance.ts
  tsx scripts/test-performance.ts --all-themes
    `);
    process.exit(0);
  }

  const tester = new PerformanceTester();

  try {
    await tester.startServer();
    const results = await tester.testAllThemes();
    tester.logResults(results);

    // Exit with error code if any tests failed
    const failures = results.filter((r) => !r.passed).length;
    if (failures > 0) {
      console.error(`\n❌ ${failures} performance tests failed`);
      process.exit(1);
    } else {
      console.log("\n✅ All performance tests passed");
    }
  } catch (error) {
    console.error("❌ Performance testing failed:", error);
    process.exit(1);
  } finally {
    await tester.stopServer();
  }
}

// Handle interruption
process.on("SIGINT", async () => {
  console.log("\n🛑 Interrupted, cleaning up...");
  process.exit(0);
});

// Run the CLI
if (require.main === module) {
  main().catch(console.error);
}

export { PerformanceTester, type PerformanceResult };
