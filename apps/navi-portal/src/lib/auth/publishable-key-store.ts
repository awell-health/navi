import { kv } from "@vercel/kv";
import type { PublishableKeyData } from "@awell-health/navi-core";
import { minimatch } from "minimatch";

/**
 * Validated Key Data Structure
 *
 * Simplified data structure returned after successful publishable key validation.
 * Contains only the essential information needed for authenticated operations.
 */
export interface ValidatedKeyData
  extends Pick<PublishableKeyData, "orgId" | "tenantId" | "environment"> {
  isValid: boolean;
}

/**
 * KV-based storage for publishable key data
 * Handles CRUD operations for publishable key configurations
 */
export class PublishableKeyStore {
  private static readonly KEY_PREFIX = "publishable-key:";

  /**
   * Get publishable key data by key
   */
  async get(key: string): Promise<PublishableKeyData | null> {
    if (!key) return null;

    try {
      const kvKey = `${PublishableKeyStore.KEY_PREFIX}${key}`;
      const keyData = (await kv.get(kvKey)) as PublishableKeyData | null;

      if (keyData) {
        console.log(`🔑 Publishable key retrieved from KV: ${key}`);
      } else {
        console.log(`🔍 Publishable key not found in KV: ${key}`);
      }

      return keyData;
    } catch (error) {
      console.error(`❌ Failed to get publishable key from KV: ${key}`, error);
      return null;
    }
  }

  /**
   * Store publishable key data
   */
  async set(
    key: string,
    keyData: Omit<PublishableKeyData, "createdAt" | "updatedAt">
  ): Promise<void> {
    if (!key) throw new Error("Publishable key is required");

    try {
      const kvKey = `${PublishableKeyStore.KEY_PREFIX}${key}`;
      const now = new Date().toISOString();

      const dataToStore: PublishableKeyData = {
        ...keyData,
        createdAt: now,
        updatedAt: now,
      };

      await kv.set(kvKey, dataToStore);
      console.log(`💾 Publishable key stored in KV: ${key}`);
    } catch (error) {
      console.error(`❌ Failed to store publishable key in KV: ${key}`, error);
      throw error;
    }
  }

  /**
   * Update publishable key data
   */
  async update(
    key: string,
    updates: Partial<Omit<PublishableKeyData, "key" | "createdAt">>
  ): Promise<void> {
    if (!key) throw new Error("Publishable key is required");

    try {
      const existing = await this.get(key);
      if (!existing) {
        throw new Error(`Publishable key not found: ${key}`);
      }

      const kvKey = `${PublishableKeyStore.KEY_PREFIX}${key}`;
      const updatedData: PublishableKeyData = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await kv.set(kvKey, updatedData);
      console.log(`🔄 Publishable key updated in KV: ${key}`);
    } catch (error) {
      console.error(`❌ Failed to update publishable key in KV: ${key}`, error);
      throw error;
    }
  }

  /**
   * Delete publishable key data
   */
  async delete(key: string): Promise<void> {
    if (!key) return;

    try {
      const kvKey = `${PublishableKeyStore.KEY_PREFIX}${key}`;
      await kv.del(kvKey);
      console.log(`🗑️ Publishable key deleted from KV: ${key}`);
    } catch (error) {
      console.error(
        `❌ Failed to delete publishable key from KV: ${key}`,
        error
      );
    }
  }

  /**
   * Check if publishable key exists
   */
  async exists(key: string): Promise<boolean> {
    const keyData = await this.get(key);
    return keyData !== null;
  }

  /**
   * Get publishable key by organization ID
   */
  async getByOrgId(orgId: string): Promise<PublishableKeyData[]> {
    if (!orgId) return [];

    try {
      // Note: This is a simplified implementation
      // In production, you might want to maintain a separate index
      // or use a different data structure for efficient orgId lookups
      console.log(`🔍 Looking up publishable keys for org: ${orgId}`);

      // For now, return empty array - you'll need to implement
      // a more sophisticated lookup mechanism based on your needs
      return [];
    } catch (error) {
      console.error(
        `❌ Failed to get publishable keys by orgId from KV: ${orgId}`,
        error
      );
      return [];
    }
  }

  /**
   * Validate a publishable key and return organization data
   */
  async validateKey(
    publishableKey: string,
    origin?: string
  ): Promise<ValidatedKeyData | null> {
    // Basic format validation
    if (
      !publishableKey.startsWith("pk_test_") &&
      !publishableKey.startsWith("pk_live_")
    ) {
      console.warn("❌ Invalid publishable key format:", publishableKey);
      return null;
    }

    // Get key data from store
    const keyData = await this.get(publishableKey);

    if (!keyData) {
      console.warn("❌ Publishable key not found:", publishableKey);
      return null;
    }

    if (!keyData.isActive) {
      console.warn("❌ Publishable key is inactive:", publishableKey);
      return null;
    }

    // Validate origin if provided (more strict for production environments)
    if (origin) {
      const originHost = new URL(origin).host;
      if (!keyData.allowedDomains || keyData.allowedDomains.length === 0) {
        console.warn("❌ No allowed domains for key:", publishableKey);
        return null;
      }
      if (
        !keyData.allowedDomains.every((domain) => minimatch(originHost, domain))
      ) {
        console.warn("❌ Origin not allowed for key:", {
          publishableKey,
          origin,
          allowedDomains: keyData.allowedDomains,
        });
        return null;
      }
    }

    console.log("✅ Publishable key validated:", {
      key: publishableKey,
      orgId: keyData.orgId,
      tenantId: keyData.tenantId,
      environment: keyData.environment,
    });

    return {
      orgId: keyData.orgId,
      tenantId: keyData.tenantId,
      environment: keyData.environment,
      isValid: true,
    };
  }

  /**
   * Bulk set multiple publishable key configurations
   */
  async setMultiple(
    keyMap: Record<string, Omit<PublishableKeyData, "createdAt" | "updatedAt">>
  ): Promise<void> {
    const operations = Object.entries(keyMap).map(([key, keyData]) =>
      this.set(key, keyData)
    );

    await Promise.all(operations);
    console.log(
      `💾 Bulk stored ${
        Object.keys(keyMap).length
      } publishable key configurations`
    );
  }

  /**
   * Get all publishable keys (for debugging - simplified for development)
   */
  async getAllKeys(): Promise<PublishableKeyData[]> {
    console.warn(
      "⚠️  getAllKeys is limited in KV store - use for debugging only"
    );
    return [];
  }
}

// Export singleton instance
export const publishableKeyStore = new PublishableKeyStore();
