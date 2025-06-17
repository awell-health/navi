import { get } from '@vercel/edge-config';
import type { OrgBranding } from '../types';

/**
 * Edge Config-based storage for organizational branding data
 * Read-only storage optimized for low-latency global access
 */
export class EdgeConfigBrandingStore {
  private static readonly CONFIG_KEY = 'branding';
  
  /**
   * Get branding configuration for an organization from Edge Config
   * Returns null if not found or on error (graceful degradation)
   */
  async get(orgId: string): Promise<OrgBranding['branding'] | null> {
    if (!orgId) return null;
    
    try {
      // Get the entire branding config object
      const brandingConfig = await get<Record<string, OrgBranding['branding']>>(EdgeConfigBrandingStore.CONFIG_KEY);
      
      if (!brandingConfig) {
        console.log('🔍 No branding config found in Edge Config');
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
      console.error(`❌ Failed to get branding from Edge Config: ${orgId}`, error);
      return null;
    }
  }
  
  /**
   * Check if branding exists for an organization in Edge Config
   */
  async exists(orgId: string): Promise<boolean> {
    const branding = await this.get(orgId);
    return branding !== null;
  }
  
  /**
   * Get all available organization IDs with branding in Edge Config
   */
  async getAvailableOrgIds(): Promise<string[]> {
    try {
      const brandingConfig = await get<Record<string, OrgBranding['branding']>>(EdgeConfigBrandingStore.CONFIG_KEY);
      
      if (!brandingConfig) {
        return [];
      }
      
      return Object.keys(brandingConfig);
    } catch (error) {
      console.error('❌ Failed to get org IDs from Edge Config:', error);
      return [];
    }
  }
}

// Export singleton instance
export const edgeConfigBrandingStore = new EdgeConfigBrandingStore(); 