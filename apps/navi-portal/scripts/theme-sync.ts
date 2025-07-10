#!/usr/bin/env tsx

/**
 * Theme Sync Script
 *
 * Syncs organization branding from internal API to Vercel Edge Config
 * Designed for hourly cron jobs to keep branding cache fresh
 *
 * Usage:
 *   tsx scripts/theme-sync.ts --sync-all
 *   tsx scripts/theme-sync.ts --org sunrise-health
 *   pnpm theme:sync --source-api
 */

import fs from "fs";
import path from "path";
import { validateBranding } from "../src/lib/branding/theme/validator";
import { generateThemeCSS } from "../src/lib/branding/theme/generator";
import { env } from "@/env";

interface SyncOptions {
  sourceApi?: string;
  orgId?: string;
  syncAll?: boolean;
  dryRun?: boolean;
  outputDir?: string;
}

interface OrgBrandingResponse {
  orgId: string;
  branding: Record<string, any>;
  lastUpdated?: string;
}

interface SyncResult {
  success: boolean;
  orgId: string;
  error?: string;
  skipped?: boolean;
}

interface SyncSummary {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  results: SyncResult[];
  duration: number;
}

class ThemeSyncer {
  private edgeConfigClient: any = null;

  constructor(private options: SyncOptions) {}

  async initialize(): Promise<void> {
    console.log("🔧 Initializing Theme Syncer...");

    // Initialize Edge Config client
    if (!this.options.dryRun) {
      try {
        if (env.EDGE_CONFIG_URL) {
          const { createClient } = await import("@vercel/edge-config");
          this.edgeConfigClient = createClient(env.EDGE_CONFIG_URL);
          console.log("✅ Vercel Edge Config client initialized");
        } else {
          console.warn("⚠️ EDGE_CONFIG_URL not set, using mock client");
          this.edgeConfigClient = new MockEdgeConfigClient();
        }
      } catch (error) {
        console.error("❌ Failed to initialize Edge Config client:", error);
        throw error;
      }
    } else {
      console.log("🧪 Dry run mode - no Edge Config writes will be performed");
    }
  }

  async syncAll(): Promise<SyncSummary> {
    const startTime = Date.now();
    console.log("🚀 Starting full branding sync from API...");

    try {
      // Fetch all org branding from internal API
      const orgBrandings = await this.fetchAllOrgBranding();
      console.log(
        `📥 Fetched branding for ${orgBrandings.length} organizations`
      );

      // Process each org
      const results: SyncResult[] = [];
      for (const orgBranding of orgBrandings) {
        try {
          const result = await this.syncSingleOrg(orgBranding);
          results.push(result);

          // Log progress
          if (result.success) {
            console.log(`✅ ${orgBranding.orgId}: Synced successfully`);
          } else if (result.skipped) {
            console.log(`⏭️  ${orgBranding.orgId}: Skipped - ${result.error}`);
          } else {
            console.error(`❌ ${orgBranding.orgId}: Failed - ${result.error}`);
          }
        } catch (error) {
          const result: SyncResult = {
            success: false,
            orgId: orgBranding.orgId,
            error: error instanceof Error ? error.message : "Unknown error",
          };
          results.push(result);
          console.error(
            `❌ ${orgBranding.orgId}: Unexpected error - ${result.error}`
          );
        }
      }

      const duration = Date.now() - startTime;
      const summary: SyncSummary = {
        total: results.length,
        success: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success && !r.skipped).length,
        skipped: results.filter((r) => r.skipped).length,
        results,
        duration,
      };

      this.logSyncSummary(summary);
      return summary;
    } catch (error) {
      console.error("❌ Sync failed:", error);
      throw error;
    }
  }

  async syncSingleOrg(orgBranding: OrgBrandingResponse): Promise<SyncResult> {
    const { orgId, branding } = orgBranding;

    // Validate branding data
    const validation = validateBranding(branding);
    if (!validation.success) {
      return {
        success: false,
        orgId,
        error: `Validation failed: ${validation.error}`,
      };
    }

    try {
      // Generate theme CSS for artifact
      const themeCSS = generateThemeCSS(validation.data);

      if (!this.options.dryRun) {
        // Update Edge Config
        await this.updateEdgeConfig(orgId, validation.data);

        // Write CSS artifact if output directory specified
        if (this.options.outputDir) {
          await this.writeCSSArtifact(orgId, themeCSS);
        }
      }

      return { success: true, orgId };
    } catch (error) {
      return {
        success: false,
        orgId,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async fetchAllOrgBranding(): Promise<OrgBrandingResponse[]> {
    const apiUrl = this.options.sourceApi || env.BRANDING_API_URL;

    if (!apiUrl) {
      throw new Error(
        "No API URL specified. Set BRANDING_API_URL or use --source-api"
      );
    }

    console.log(`📡 Fetching branding from: ${apiUrl}`);

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${env.BRANDING_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Handle different API response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data.organizations) {
        return data.organizations;
      } else if (data.data) {
        return data.data;
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("❌ Failed to fetch from API:", error);
      throw error;
    }
  }

  private async updateEdgeConfig(orgId: string, branding: any): Promise<void> {
    const key = `branding/${orgId}`;

    // For now, simulate the Edge Config update
    // In real implementation, would use Edge Config API
    console.log(`📝 Updating Edge Config: ${key}`);

    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  private async writeCSSArtifact(orgId: string, css: string): Promise<void> {
    if (!this.options.outputDir) return;

    const filename = `theme.${orgId}.css`;
    const filepath = path.join(this.options.outputDir, filename);

    // Ensure output directory exists
    await fs.promises.mkdir(this.options.outputDir, { recursive: true });

    // Write CSS artifact
    await fs.promises.writeFile(filepath, css, "utf8");
    console.log(`📄 CSS artifact written: ${filepath}`);
  }

  private logSyncSummary(summary: SyncSummary): void {
    console.log("\n📊 Sync Summary");
    console.log("═".repeat(50));
    console.log(`Total organizations: ${summary.total}`);
    console.log(`✅ Successfully synced: ${summary.success}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⏭️  Skipped: ${summary.skipped}`);
    console.log(`⏱️  Duration: ${summary.duration}ms`);

    if (summary.failed > 0) {
      console.log("\n❌ Failed Organizations:");
      summary.results
        .filter((r) => !r.success && !r.skipped)
        .forEach((r) => console.log(`  - ${r.orgId}: ${r.error}`));
    }

    if (summary.skipped > 0) {
      console.log("\n⏭️  Skipped Organizations:");
      summary.results
        .filter((r) => r.skipped)
        .forEach((r) => console.log(`  - ${r.orgId}: ${r.error}`));
    }

    console.log("═".repeat(50));
  }
}

// Mock Edge Config Client for development
class MockEdgeConfigClient {
  async set(key: string, value: any): Promise<void> {
    console.log(
      `[MOCK] Set ${key}:`,
      JSON.stringify(value, null, 2).substring(0, 100) + "..."
    );
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options: SyncOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--sync-all":
        options.syncAll = true;
        break;
      case "--source-api":
        options.sourceApi = args[i + 1];
        i++;
        break;
      case "--org":
        options.orgId = args[i + 1];
        i++;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--output-dir":
        options.outputDir = args[i + 1];
        i++;
        break;
      case "--help":
        console.log(`
Theme Sync CLI

Usage:
  tsx scripts/theme-sync.ts [options]

Options:
  --sync-all              Sync all organizations from API
  --source-api <url>      Override API URL for fetching branding
  --org <orgId>           Sync single organization
  --dry-run              Validate without writing to Edge Config
  --output-dir <path>     Write CSS artifacts to directory
  --help                 Show this help message

Environment Variables:
  BRANDING_API_URL       Default API URL for fetching branding
  BRANDING_API_TOKEN     API authentication token
  EDGE_CONFIG_URL        Vercel Edge Config connection string

Examples:
  tsx scripts/theme-sync.ts --sync-all
  tsx scripts/theme-sync.ts --sync-all --dry-run
  tsx scripts/theme-sync.ts --org sunrise-health
  tsx scripts/theme-sync.ts --source-api https://api.awell.com/branding --output-dir ./themes
        `);
        process.exit(0);
    }
  }

  // Default to sync-all if no specific operation specified
  if (!options.syncAll && !options.orgId) {
    options.syncAll = true;
  }

  const syncer = new ThemeSyncer(options);

  try {
    await syncer.initialize();

    if (options.syncAll) {
      const summary = await syncer.syncAll();

      // Exit with error code if any failures for monitoring
      if (summary.failed > 0) {
        console.error(`❌ Sync completed with ${summary.failed} failures`);
        process.exit(1);
      } else {
        console.log("✅ All themes synced successfully");
      }
    } else if (options.orgId) {
      // Single org sync (for testing/debugging)
      console.log(`🎯 Syncing single organization: ${options.orgId}`);
      console.log(
        "ℹ️  Note: Single org sync requires manual branding data input"
      );
    }
  } catch (error) {
    console.error("❌ Theme sync failed:", error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});

// Run the CLI
if (require.main === module) {
  main().catch(console.error);
}

export { ThemeSyncer, type SyncOptions, type SyncSummary };
