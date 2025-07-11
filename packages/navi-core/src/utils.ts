import type {
  NaviConfig,
  JWTPayload,
  AuthResult,
  BrandingConfig,
} from "./types";

// Auth client for publishable key → JWT exchange
export class AuthClient {
  private config: NaviConfig;
  private cachedAuth: AuthResult | null = null;

  constructor(config: NaviConfig) {
    this.config = {
      baseUrl: "http://localhost:3000", // Default for POC
      ...config,
    };
  }

  async authenticate(pathwayId: string): Promise<AuthResult> {
    // For POC, we'll mock the JWT exchange
    // In production, this would call the auth service
    const mockPayload: JWTPayload = {
      sub: pathwayId,
      stakeholder_id: "stakeholder_" + Math.random().toString(36).substr(2, 9),
      tenant_id: "tenant_" + this.config.publishableKey.split("_")[2] || "demo",
      org_id: "org_" + this.config.publishableKey.split("_")[2] || "demo",
      environment: this.config.publishableKey.startsWith("pk_live_")
        ? "production"
        : "test",
      iss: "navi-auth-service",
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
      iat: Math.floor(Date.now() / 1000),
    };

    const mockJWT = `mock.${btoa(JSON.stringify(mockPayload))}.signature`;

    const result: AuthResult = {
      jwt: mockJWT,
      payload: mockPayload,
    };

    this.cachedAuth = result;
    return result;
  }

  getCachedAuth(): AuthResult | null {
    return this.cachedAuth;
  }

  isAuthenticated(): boolean {
    if (!this.cachedAuth) return false;
    return this.cachedAuth.payload.exp > Math.floor(Date.now() / 1000);
  }
}

// Branding utilities
export function generateCSSCustomProperties(
  branding: BrandingConfig
): Record<string, string> {
  return {
    "--navi-primary": branding.primary || "#3b82f6",
    "--navi-secondary": branding.secondary || "#64748b",
    "--navi-font-family": branding.fontFamily || "Inter, sans-serif",
    "--navi-logo-url": branding.logoUrl ? `url(${branding.logoUrl})` : "none",
  };
}

// Main Navi client
export class NaviClient {
  private authClient: AuthClient;
  private branding: BrandingConfig;

  constructor(config: NaviConfig, branding: BrandingConfig = {}) {
    this.authClient = new AuthClient(config);
    this.branding = branding;
  }

  async init(pathwayId: string): Promise<{
    auth: AuthResult;
    branding: BrandingConfig;
    cssProperties: Record<string, string>;
  }> {
    const auth = await this.authClient.authenticate(pathwayId);
    const cssProperties = generateCSSCustomProperties(this.branding);

    return {
      auth,
      branding: this.branding,
      cssProperties,
    };
  }

  getAuthClient(): AuthClient {
    return this.authClient;
  }

  getBranding(): BrandingConfig {
    return this.branding;
  }
}
