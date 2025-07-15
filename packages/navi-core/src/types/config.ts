/**
 * Shared Branding Configuration
 *
 * This is the single source of truth for branding interfaces across all Navi packages.
 * Used by:
 * - navi.js (CDN SDK)
 * - navi-react (React components)
 * - navi-portal (external APIs and branding supplements)
 * - Customer applications
 *
 * Do not duplicate this interface - import it from navi-core instead.
 */
export interface BrandingConfig {
  // Core colors
  primary?: string;
  secondary?: string;

  // Typography
  fontFamily?: string;

  // Branding assets
  logoUrl?: string;
  logoWidth?: string;
  logoHeight?: string;
  faviconUrl?: string;

  // Welcome page customization
  welcomeTitle?: string;
  welcomeSubtitle?: string;

  // Extended colors (optional)
  background?: string;
  surface?: string;
  error?: string;
  success?: string;
}
