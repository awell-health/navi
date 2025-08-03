import { get } from "@vercel/edge-config";
import type { OrgBranding } from "../types";

/**
 * Edge Config-based storage for organizational branding data
 * Read-only storage optimized for low-latency global access
 */
export class EdgeConfigBrandingStore {
  private static readonly CONFIG_KEY = "branding";

  /**
   * Get branding configuration for an organization from Edge Config
   * Returns null if not found or on error (graceful degradation)
   */
  async get(orgId: string): Promise<OrgBranding["branding"] | null> {
    if (!orgId) return null;

    // Check if Edge Config is properly configured
    if (!process.env.EDGE_CONFIG) {
      console.log(
        "🔍 Edge Config not configured (EDGE_CONFIG env var missing), skipping..."
      );
      return null;
    }

    try {
      // Get the entire branding config object
      const brandingConfig = await get<Record<string, OrgBranding["branding"]>>(
        EdgeConfigBrandingStore.CONFIG_KEY
      );

      if (!brandingConfig) {
        console.log("🔍 No branding config found in Edge Config");
        return null;
      }

      const branding = brandingConfig[orgId];

      if (branding) {
        console.log(`⚡ Branding retrieved from Edge Config: ${orgId}`);
      } else {
        console.log(`🔍 Branding not found in Edge Config: ${orgId}`);
      }

      return branding || null;
    } catch (error) {
      console.error(
        `❌ Failed to get branding from Edge Config: ${orgId}`,
        error
      );
      return null;
    }
  }

  /**
   * Check if branding exists for an organization in Edge Config
   */
  async exists(orgId: string): Promise<boolean> {
    if (!process.env.EDGE_CONFIG) {
      return false;
    }
    const branding = await this.get(orgId);
    return branding !== null;
  }

  /**
   * Get all available organization IDs with branding in Edge Config
   */
  async getAvailableOrgIds(): Promise<string[]> {
    if (!process.env.EDGE_CONFIG) {
      return [];
    }

    try {
      const brandingConfig = await get<Record<string, OrgBranding["branding"]>>(
        EdgeConfigBrandingStore.CONFIG_KEY
      );

      if (!brandingConfig) {
        return [];
      }

      return Object.keys(brandingConfig);
    } catch (error) {
      console.error("❌ Failed to get org IDs from Edge Config:", error);
      return [];
    }
  }

  /**
   * Update branding for an organization in Edge Config
   * Uses Vercel REST API to write data
   */
  async set(orgId: string, branding: OrgBranding["branding"]): Promise<void> {
    const edgeConfigUrl = process.env.EDGE_CONFIG;
    const vercelApiToken = process.env.VERCEL_API_TOKEN;

    if (!edgeConfigUrl) {
      throw new Error("EDGE_CONFIG environment variable is required");
    }

    if (!vercelApiToken) {
      throw new Error("VERCEL_API_TOKEN environment variable is required");
    }

    // Extract Edge Config ID from URL
    // Format: https://edge-config.vercel.com/{id}?token={token}
    const urlMatch = edgeConfigUrl.match(/edge-config\.vercel\.com\/([^/?]+)/);
    if (!urlMatch) {
      throw new Error("Invalid EDGE_CONFIG URL format");
    }
    const edgeConfigId = urlMatch[1];

    // Build API URL
    let apiUrl = `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`;
    const teamId = process.env.VERCEL_TEAM_ID;
    if (teamId) {
      apiUrl += `?teamId=${teamId}`;
    }

    try {
      // Get current branding config to merge with
      const currentConfig =
        (await get<Record<string, OrgBranding["branding"]>>(
          EdgeConfigBrandingStore.CONFIG_KEY
        )) || {};

      // Update the specific org's branding
      const updatedConfig = {
        ...currentConfig,
        [orgId]: branding,
      };

      const payload = {
        items: [
          {
            operation: "upsert" as const,
            key: EdgeConfigBrandingStore.CONFIG_KEY,
            value: updatedConfig,
          },
        ],
      };

      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${vercelApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Edge Config API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();

      if (result.status !== "ok") {
        throw new Error(`Edge Config update failed: ${JSON.stringify(result)}`);
      }

      console.log(`📝 Updated Edge Config branding for ${orgId}`);
    } catch (error) {
      console.error(`❌ Failed to update Edge Config for ${orgId}:`, error);
      throw error;
    }
  }

  /**
   * Remove branding for an organization from Edge Config
   */
  async delete(orgId: string): Promise<void> {
    const edgeConfigUrl = process.env.EDGE_CONFIG;
    const vercelApiToken = process.env.VERCEL_API_TOKEN;

    if (!edgeConfigUrl) {
      throw new Error("EDGE_CONFIG environment variable is required");
    }

    if (!vercelApiToken) {
      throw new Error("VERCEL_API_TOKEN environment variable is required");
    }

    // Extract Edge Config ID from URL
    const urlMatch = edgeConfigUrl.match(/edge-config\.vercel\.com\/([^/?]+)/);
    if (!urlMatch) {
      throw new Error("Invalid EDGE_CONFIG URL format");
    }
    const edgeConfigId = urlMatch[1];

    // Build API URL
    let apiUrl = `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`;
    const teamId = process.env.VERCEL_TEAM_ID;
    if (teamId) {
      apiUrl += `?teamId=${teamId}`;
    }

    try {
      // Get current branding config
      const currentConfig =
        (await get<Record<string, OrgBranding["branding"]>>(
          EdgeConfigBrandingStore.CONFIG_KEY
        )) || {};

      delete currentConfig[orgId];

      const payload = {
        items: [
          {
            operation: "upsert" as const,
            key: EdgeConfigBrandingStore.CONFIG_KEY,
            value: currentConfig,
          },
        ],
      };

      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${vercelApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Edge Config API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();

      if (result.status !== "ok") {
        throw new Error(`Edge Config delete failed: ${JSON.stringify(result)}`);
      }

      console.log(`🗑️ Deleted Edge Config branding for ${orgId}`);
    } catch (error) {
      console.error(`❌ Failed to delete Edge Config for ${orgId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const edgeConfigBrandingStore = new EdgeConfigBrandingStore();
