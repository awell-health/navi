/**
 * Navi Client Configuration
 */
export interface NaviClientConfig {
  publishableKey: string;
  apiUrl?: string;
  debug?: boolean;
  timeout?: number;
}

/**
 * Navi Configuration (Alternative/Legacy)
 */
export interface NaviConfig {
  publishableKey: string;
  baseUrl?: string;
}

/**
 * Branding Configuration
 */
export interface BrandingConfig {
  primary?: string;
  secondary?: string;
  fontFamily?: string;
  logoUrl?: string;
}
