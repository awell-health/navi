import { edgeConfigBrandingStore } from "./storage/edge-store";
import { brandingStore } from "./storage/kv-store";
import { sampleBrandingData } from "./sample-data";
import { awellDefaultBranding } from "./defaults";
import type { OrgBranding } from "./types";

/**
 * Main branding service that handles all organizational branding operations
 * Provides the public API for branding functionality
 */
export class BrandingService {
  private static seeded = false;

  /**
   * Initialize the service by seeding sample data
   */
  private async seedSampleData(): Promise<void> {
    if (BrandingService.seeded) return;

    try {
      console.log("🌱 Seeding sample branding data...");

      // Check which sample orgs don't exist yet
      const seedOperations = [];

      for (const [orgId, branding] of Object.entries(sampleBrandingData)) {
        const exists = await brandingStore.exists(orgId);
        if (!exists) {
          seedOperations.push(brandingStore.set(orgId, branding));
          console.log(`🌱 Queued seeding for: ${orgId}`);
        }
      }

      // Execute all seed operations in parallel
      if (seedOperations.length > 0) {
        await Promise.all(seedOperations);
        console.log(`✅ Seeded ${seedOperations.length} sample organizations`);
      } else {
        console.log("✅ Sample data already exists, skipping seed");
      }

      BrandingService.seeded = true;
    } catch (error) {
      console.warn("⚠️ Failed to seed branding data:", error);
    }
  }

  /**
   * Get branding for an organization with fallback to defaults
   * Tries Edge Config first (fast, read-only), then KV (slower, read-write), then defaults
   */
  async getBrandingByOrgId(orgId: string): Promise<OrgBranding["branding"]> {
    if (!orgId) {
      console.log("🎨 No orgId provided, using empty branding");
      return {};
    }

    if (orgId === "default") {
      console.log("🎨 orgId is default, using default branding");
      return awellDefaultBranding.branding;
    }

    try {
      const startTime = Date.now();

      // Try Edge Config first (production setup, <20ms latency)
      let branding = await edgeConfigBrandingStore.get(orgId);
      let source = "Edge Config";

      // Fallback to KV store if not in Edge Config (development/prototype)
      if (!branding) {
        console.log(
          `🔄 Branding not in Edge Config for ${orgId}, trying KV store...`
        );
        branding = await brandingStore.get(orgId);
        source = "KV Store";
      }

      const latency = Date.now() - startTime;

      // Log performance for monitoring
      console.log(
        `📊 Branding latency: ${latency}ms from ${source} for org: ${orgId}`
      );

      // Warn if latency exceeds budget (only for Edge Config)
      if (source === "Edge Config" && latency > 20) {
        console.warn(
          `⚠️ Edge Config latency exceeded 20ms budget: ${latency}ms`
        );
      }

      return branding ?? {};
    } catch (error) {
      console.error("Failed to fetch branding:", error);
      console.log("🎨 Falling back to empty branding due to error");
      return {};
    }
  }

  /**
   * Set branding for an organization
   */
  async setBrandingForOrg(
    orgId: string,
    branding: OrgBranding["branding"]
  ): Promise<void> {
    if (!orgId) throw new Error("Organization ID is required");

    try {
      // Update both KV store and Edge Config for immediate consistency
      await Promise.all([
        brandingStore.set(orgId, branding),
        edgeConfigBrandingStore.set(orgId, branding),
      ]);
      console.log(`🎨 Branding updated for: ${orgId} (KV + Edge Config)`);
    } catch (error) {
      console.error(`Failed to set branding for ${orgId}:`, error);
      throw error;
    }
  }

  /**
   * Delete branding for an organization (will fall back to defaults)
   */
  async deleteBrandingForOrg(orgId: string): Promise<void> {
    if (!orgId) return;

    try {
      // Delete from both KV store and Edge Config for immediate consistency
      await Promise.all([
        brandingStore.delete(orgId),
        edgeConfigBrandingStore.delete(orgId),
      ]);
      console.log(
        `🎨 Branding deleted for: ${orgId} (KV + Edge Config, will use defaults)`
      );
    } catch (error) {
      console.error(`Failed to delete branding for ${orgId}:`, error);
      throw error;
    }
  }

  /**
   * Check if an organization has custom branding
   */
  async hasCustomBranding(orgId: string): Promise<boolean> {
    if (!orgId) return false;

    try {
      return await brandingStore.exists(orgId);
    } catch (error) {
      console.error(`Failed to check branding existence for ${orgId}:`, error);
      return false;
    }
  }

  /**
   * Get branding info with metadata
   */
  async getBrandingInfo(orgId: string): Promise<{
    branding: OrgBranding["branding"];
    orgId: string;
    hasCustomBranding: boolean;
  }> {
    const hasCustomBranding = await this.hasCustomBranding(orgId);
    const branding = await this.getBrandingByOrgId(orgId);

    return {
      branding,
      orgId: orgId || awellDefaultBranding.orgId,
      hasCustomBranding,
    };
  }

  /**
   * Bulk import branding configurations
   */
  async importBranding(
    brandingMap: Record<string, OrgBranding["branding"]>
  ): Promise<void> {
    try {
      await brandingStore.setMultiple(brandingMap);
      console.log(
        `🎨 Imported branding for ${
          Object.keys(brandingMap).length
        } organizations`
      );
    } catch (error) {
      console.error("Failed to import branding:", error);
      throw error;
    }
  }

  /**
   * Seed sample data manually (useful for development)
   */
  async forceSeedSampleData(): Promise<void> {
    BrandingService.seeded = false;
    await this.seedSampleData();
  }
}

// Export singleton instance
export const brandingService = new BrandingService();

// Export convenience function for backward compatibility
export const getBrandingByOrgId = (orgId: string) =>
  brandingService.getBrandingByOrgId(orgId);
