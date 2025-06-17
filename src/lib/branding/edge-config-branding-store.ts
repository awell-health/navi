import { edgeConfig } from '@/lib/edge-config';
import type { OrgBranding } from '@/lib/theme/types';

/**
 * Edge Config-based storage for organizational branding data
 * Read-only access with <20ms latency budget (edge-replicated)
 * 
 * Note: Edge Config is updated at deploy-time only
 * For real-time branding updates, use KV store instead
 */
export class EdgeConfigBrandingStore {
  private static readonly KEY_PREFIX = 'org:';
  
  /**
   * Get branding configuration for an organization from Edge Config
   */
  async get(orgId: string): Promise<OrgBranding['branding'] | null> {
    if (!orgId) return null;
    
    try {
      const startTime = Date.now();
      const key = `${EdgeConfigBrandingStore.KEY_PREFIX}${orgId}`;
      
      if (!edgeConfig) {
        console.warn('⚠️ Edge Config not available, no branding data');
        return null;
      }
      
      const orgData = await edgeConfig.get(key) as OrgBranding | null;
      const latency = Date.now() - startTime;
      
      // Log performance for monitoring
      console.log(`⚡ Edge Config latency: ${latency}ms for org: ${orgId}`);
      
      // Warn if latency exceeds budget
      if (latency > 20) {
        console.warn(`⚠️ Edge Config latency exceeded 20ms budget: ${latency}ms`);
      }
      
      if (orgData?.branding) {
        console.log(`🎨 Branding retrieved from Edge Config: ${orgId}`);
        return orgData.branding;
      } else {
        console.log(`🔍 Branding not found in Edge Config: ${orgId}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Failed to get branding from Edge Config: ${orgId}`, error);
      return null;
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
   * Edge Config is read-only - cannot set data at runtime
   * Branding must be updated via deployment/configuration
   */
  async set(): Promise<never> {
    throw new Error('Edge Config is read-only. Branding must be updated via deployment configuration.');
  }
  
  /**
   * Edge Config is read-only - cannot delete data at runtime
   */
  async delete(): Promise<never> {
    throw new Error('Edge Config is read-only. Branding must be updated via deployment configuration.');
  }
  
  /**
   * Edge Config is read-only - cannot bulk set data at runtime
   */
  async setMultiple(): Promise<never> {
    throw new Error('Edge Config is read-only. Branding must be updated via deployment configuration.');
  }
}

// Export singleton instance
export const edgeConfigBrandingStore = new EdgeConfigBrandingStore();