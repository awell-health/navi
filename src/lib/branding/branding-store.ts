import { kv } from '@vercel/kv';
import type { OrgBranding } from '@/lib/theme/types';

/**
 * KV-based storage for organizational branding data
 * Handles CRUD operations for branding configurations
 */
export class BrandingStore {
  private static readonly KEY_PREFIX = 'branding:';
  
  /**
   * Get branding configuration for an organization
   */
  async get(orgId: string): Promise<OrgBranding['branding'] | null> {
    if (!orgId) return null;
    
    try {
      const key = `${BrandingStore.KEY_PREFIX}${orgId}`;
      const branding = await kv.get(key) as OrgBranding['branding'] | null;
      
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
  async set(orgId: string, branding: OrgBranding['branding']): Promise<void> {
    if (!orgId) throw new Error('Organization ID is required');
    
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
  async setMultiple(brandingMap: Record<string, OrgBranding['branding']>): Promise<void> {
    const operations = Object.entries(brandingMap).map(([orgId, branding]) =>
      this.set(orgId, branding)
    );
    
    await Promise.all(operations);
    console.log(`💾 Bulk stored ${Object.keys(brandingMap).length} branding configurations`);
  }
}

// Export singleton instance
export const brandingStore = new BrandingStore(); 