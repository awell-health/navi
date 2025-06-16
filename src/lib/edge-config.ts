import { type OrgBranding } from './theme/types';

// Real Vercel Edge Config integration
let edgeConfigClient: EdgeConfigClient | MockEdgeConfigClient | null = null;

// Initialize Edge Config client
async function initEdgeConfig(): Promise<EdgeConfigClient | MockEdgeConfigClient> {
  if (edgeConfigClient) return edgeConfigClient;
  
  // Use real Vercel Edge Config in production
  if (process.env.EDGE_CONFIG_URL && typeof window === 'undefined') {
    try {
      const { createClient } = await import('@vercel/edge-config');
      const client = createClient(process.env.EDGE_CONFIG_URL);
      // Wrap in adapter to match our interface
      edgeConfigClient = {
        async get(key: string) {
          const result = await client.get(key);
          return result ?? null;
        }
      } as EdgeConfigClient;
      console.log('✅ Vercel Edge Config initialized');
      return edgeConfigClient;
    } catch (error) {
      console.warn('⚠️ Failed to initialize Vercel Edge Config, falling back to mock:', error);
    }
  }
  
  // Fallback to mock for development/testing
  edgeConfigClient = new MockEdgeConfigClient();
  return edgeConfigClient;
}

// Mock Edge Config store for development
const mockBrandingStore = new Map<string, OrgBranding['branding']>();

// Load sample org branding for testing
const sampleOrgBranding: OrgBranding['branding'] = {
  // From sample_org_branding.jsonc
  primary: "#FF6C4C",
  onPrimary: "#FFFFFF",
  primaryHover: "#E95A3C",
  primaryDisabled: "#FFCFC4",

  secondary: "#004E7C",
  onSecondary: "#FFFFFF",

  background: "#FAFAFA",
  surface: "#FFFFFF",
  onSurface: "#1F1F1F",
  border: "#E0E0E0",

  error: "#D32F2F",
  onError: "#FFFFFF",
  success: "#1E8E3E",
  onSuccess: "#FFFFFF",

  // Typography
  fontFamilyBody: '"Inter", system-ui, sans-serif',
  fontFamilyHeading: '"Poppins", system-ui, sans-serif',
  fontWeightBold: "600",
  fontSizeBase: "16px",
  lineHeightBase: "1.5",

  // Radii
  radiusSm: "4px",
  radiusMd: "6px",
  radiusLg: "12px",

  // Input tokens
  inputBackground: "#FFFFFF",
  inputText: "#1F1F1F",
  inputBorder: "#B5B5B5",
  inputBorderHover: "#8A8A8A",
  inputBorderFocus: "#FF6C4C",
  inputRadius: "6px",

  // Button tokens
  buttonPaddingY: "0.75rem",
  buttonPaddingX: "1.25rem",
  buttonRadius: "6px",

  // Shadow tokens
  shadowSm: "0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.08)",

  // Welcome page customization
  logoUrl: "https://cdn.awell.health/sunrise-health/logo.svg",
  welcomeTitle: "Welcome to Sunrise Health",
  welcomeSubtitle: "Your personalized care journey starts here",
};

// Store sample branding
mockBrandingStore.set('sunrise-health', sampleOrgBranding);

// Add a second org with completely different branding
const techCorpBranding: OrgBranding['branding'] = {
  // Dark, professional tech company theme
  primary: "#0F172A",         // Dark slate primary
  onPrimary: "#F8FAFC",       // Nearly white text
  primaryHover: "#1E293B",    // Slightly lighter dark
  primaryDisabled: "#64748B", // Muted gray

  secondary: "#6366F1",       // Bright indigo secondary
  onSecondary: "#FFFFFF",     // White text

  background: "#020617",      // Very dark navy background
  surface: "#0F172A",         // Dark surface
  onSurface: "#E2E8F0",       // Light gray text
  border: "#334155",          // Medium gray border

  error: "#EF4444",           // Bright red
  onError: "#FFFFFF",
  success: "#10B981",         // Emerald green
  onSuccess: "#FFFFFF",

  // Typography - Modern tech fonts
  fontFamilyBody: '"JetBrains Mono", "SF Mono", "Monaco", "Consolas", monospace',
  fontFamilyHeading: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  fontWeightBold: "700",
  fontSizeBase: "14px",
  lineHeightBase: "1.6",

  // Sharp, modern radii
  radiusSm: "2px",
  radiusMd: "4px", 
  radiusLg: "8px",

  // Input styling
  inputBackground: "#1E293B",
  inputText: "#F8FAFC",
  inputBorder: "#475569",
  inputBorderHover: "#6366F1",
  inputBorderFocus: "#6366F1",
  inputRadius: "4px",

  // Button styling
  buttonPaddingY: "0.625rem",
  buttonPaddingX: "1rem",
  buttonRadius: "4px",

  // Subtle shadows for dark theme
  shadowSm: "0 1px 2px rgba(0,0,0,0.3)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.4)",

  // Welcome page customization
  logoUrl: "https://cdn.awell.health/techcorp/logo-white.svg",
  welcomeTitle: "Welcome to TechCorp Systems",
  welcomeSubtitle: "Advanced healthcare technology platform",
};

mockBrandingStore.set('techcorp', techCorpBranding);

export interface EdgeConfigClient {
  get(key: string): Promise<OrgBranding['branding'] | null>;
}

export class MockEdgeConfigClient implements EdgeConfigClient {
  async get(key: string): Promise<OrgBranding['branding'] | null> {
    // Simulate Edge Config 20ms latency
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const orgId = key.replace('branding/', '');
    return mockBrandingStore.get(orgId) || null;
  }
}

// Helper function to get branding by orgId
export async function getBrandingByOrgId(orgId: string): Promise<OrgBranding['branding'] | null> {
  if (!orgId) return null;
  
  try {
    const startTime = Date.now();
    const client = await initEdgeConfig();
    const branding = await client.get(`branding/${orgId}`);
    const latency = Date.now() - startTime;
    
    // Log performance for monitoring
    console.log(`📊 Edge Config latency: ${latency}ms for org: ${orgId}`);
    
    // Warn if latency exceeds budget
    if (latency > 20) {
      console.warn(`⚠️ Edge Config latency exceeded 20ms budget: ${latency}ms`);
    }
    
    return branding;
  } catch (error) {
    console.error('Failed to fetch branding from Edge Config:', error);
    return null;
  }
}

// Export for backwards compatibility
export const edgeConfig = {
  get: getBrandingByOrgId
}; 