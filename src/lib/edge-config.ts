export { getBrandingByOrgId, brandingService } from '@/lib/branding/branding-service';
import { type EdgeConfigClient } from '@vercel/edge-config';

export class VercelEdgeConfigClient {
  private client: EdgeConfigClient | null = null;
  
  constructor(url?: string) {
    if (url && typeof window === 'undefined') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { createClient } = require('@vercel/edge-config');
        this.client = createClient(url);
        console.log('✅ Vercel Edge Config initialized');
      } catch (error) {
        console.warn('⚠️ Failed to initialize Vercel Edge Config:', error);
        this.client = null;
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(key: string): Promise<any> {
    if (!this.client) {
      throw new Error('Edge Config client not initialized');
    }
    
    try {
      const result = await this.client.get(key);
      return result ?? null;
    } catch (error) {
      console.error(`Failed to get key "${key}" from Edge Config:`, error);
      return null;
    }
  }
}

// Initialize Edge Config client if URL is available
let edgeConfigClient: VercelEdgeConfigClient | null = null;

if (process.env.EDGE_CONFIG_URL) {
  edgeConfigClient = new VercelEdgeConfigClient(process.env.EDGE_CONFIG_URL);
}

// Export for general Edge Config usage
export const edgeConfig = edgeConfigClient;
