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
 *
 * Aligned with shadcn/ui theme token system for maximum compatibility.
 */
export interface BrandingConfig {
  // === Core shadcn/ui Theme Tokens ===
  // Base colors
  background?: string;
  foreground?: string;

  // Card colors
  card?: string;
  cardForeground?: string;

  // Popover colors
  popover?: string;
  popoverForeground?: string;

  // Primary colors
  primary?: string;
  primaryForeground?: string;

  // Secondary colors
  secondary?: string;
  secondaryForeground?: string;

  // Muted colors
  muted?: string;
  mutedForeground?: string;

  // Accent colors
  accent?: string;
  accentForeground?: string;

  // Destructive colors
  destructive?: string;
  destructiveForeground?: string;

  // Border & input colors
  border?: string;
  input?: string;
  ring?: string;

  // Border radius
  radius?: string;

  // === Typography ===
  // Font families
  fontFamily?: string;
  fontFamilyHeading?: string;
  fontFamilyMono?: string;

  // === Brand Assets ===
  logoUrl?: string;
  logoWidth?: string;
  logoHeight?: string;
  faviconUrl?: string;

  // === Welcome Page ===
  welcomeTitle?: string;
  welcomeSubtitle?: string;

  // === Layout ===
  navHeight?: string;
}
