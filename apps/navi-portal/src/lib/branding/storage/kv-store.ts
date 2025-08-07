import { kv } from "@vercel/kv";
import type { OrgBranding } from "../types";

/**
 * KV-based storage for organizational branding data
 * Handles CRUD operations for branding configurations
 */
export class BrandingStore {
  private static readonly KEY_PREFIX = "branding:";

  /**
   * Get branding configuration for an organization
   */
  async get(orgId: string): Promise<OrgBranding["branding"] | null> {
    if (!orgId) return null;

    try {
      const key = `${BrandingStore.KEY_PREFIX}${orgId}`;
      const branding = (await kv.get(key)) as OrgBranding["branding"] | null;

      if (branding) {
        console.log(`📦 Branding retrieved from KV: ${orgId}`);
      } else {
        console.log(`🔍 Branding not found in KV: ${orgId}`);
      }

      return branding;
    } catch (error) {
      console.error(`❌ Failed to get branding from KV: ${orgId}`, error);
      return null;
    }
  }

  /**
   * Store branding configuration for an organization
   */
  async set(orgId: string, branding: OrgBranding["branding"]): Promise<void> {
    if (!orgId) throw new Error("Organization ID is required");

    try {
      const key = `${BrandingStore.KEY_PREFIX}${orgId}`;
      await kv.set(key, branding);
      console.log(`💾 Branding stored in KV: ${orgId}`);
    } catch (error) {
      console.error(`❌ Failed to store branding in KV: ${orgId}`, error);
      throw error;
    }
  }

  /**
   * Delete branding configuration for an organization
   */
  async delete(orgId: string): Promise<void> {
    if (!orgId) return;

    try {
      const key = `${BrandingStore.KEY_PREFIX}${orgId}`;
      await kv.del(key);
      console.log(`🗑️ Branding deleted from KV: ${orgId}`);
    } catch (error) {
      console.error(`❌ Failed to delete branding from KV: ${orgId}`, error);
    }
  }

  /**
   * Check if branding exists for an organization
   */
  async exists(orgId: string): Promise<boolean> {
    const branding = await this.get(orgId);
    return branding !== null;
  }

  /**
   * Bulk set multiple branding configurations
   */
  async setMultiple(
    brandingMap: Record<string, OrgBranding["branding"]>
  ): Promise<void> {
    const operations = Object.entries(brandingMap).map(([orgId, branding]) =>
      this.set(orgId, branding)
    );

    await Promise.all(operations);
    console.log(
      `💾 Bulk stored ${
        Object.keys(brandingMap).length
      } branding configurations`
    );
  }

  /**
   * Get all branding configurations using SCAN
   * Used for build-time font generation
   */
  async getAllBranding(): Promise<Record<string, OrgBranding["branding"]>> {
    try {
      const allBranding: Record<string, OrgBranding["branding"]> = {};
      let cursor = "0";
      const seenKeys = new Set<string>();

      do {
        // Use SCAN to get keys matching branding:* pattern
        const result = await kv.scan(cursor, {
          match: `${BrandingStore.KEY_PREFIX}*`,
          count: 100,
        });

        cursor = result[0];
        const keys = result[1] as string[];

        // Get all branding data for these keys
        if (keys.length > 0) {
          const brandingData = (await kv.mget(...keys)) as (
            | OrgBranding["branding"]
            | null
          )[];

          keys.forEach((key, index) => {
            if (!seenKeys.has(key)) {
              seenKeys.add(key);

              const orgId = key.replace(BrandingStore.KEY_PREFIX, "");
              const branding = brandingData[index];
              if (branding) {
                allBranding[orgId] = branding;
              }
            }
          });
        }
      } while (cursor !== "0");

      console.log(
        `🔍 Scanned ${Object.keys(allBranding).length} branding configurations`
      );
      return allBranding;
    } catch (error) {
      console.error("❌ Failed to scan all branding configurations:", error);
      return {};
    }
  }

  /**
   * Font registry management
   */
  private static readonly FONT_REGISTRY_KEY = "fonts:registry";

  /**
   * Get the current font registry
   */
  async getFontRegistry(): Promise<string[]> {
    try {
      const fonts = (await kv.get(BrandingStore.FONT_REGISTRY_KEY)) as
        | string[]
        | null;
      return fonts || [];
    } catch (error) {
      console.error("❌ Failed to get font registry:", error);
      return [];
    }
  }

  /**
   * Update font registry with unique fonts from all branding configs
   */
  async updateFontRegistry(fonts: string[]): Promise<void> {
    try {
      const uniqueFonts = [...new Set(fonts)].sort();
      await kv.set(BrandingStore.FONT_REGISTRY_KEY, uniqueFonts);
      console.log(
        `📝 Updated font registry with ${uniqueFonts.length} fonts:`,
        uniqueFonts
      );
    } catch (error) {
      console.error("❌ Failed to update font registry:", error);
    }
  }
}

// Export singleton instance
export const brandingStore = new BrandingStore();
