// Core types and defaults
export type { OrgBranding, ThemeTokens } from './types';
export { awellDefaultBranding, awellDefaultTheme } from './defaults';

// Main service
export { BrandingService, brandingService, getBrandingByOrgId } from './branding-service';

// Storage implementations
export { brandingStore } from './storage/kv-store';
export { edgeConfigBrandingStore } from './storage/edge-store';

// Theme generation
export {
  generateThemeCSS,
  generateInlineThemeStyle,
  generateFaviconHTML,
  getFaviconUrl,
  getFaviconType,
  brandingToTokens,
  generateFontCSS,
} from './theme/generator';

// Validation
export {
  validateBranding,
  validateOrgBranding,
  brandingSchema,
  orgBrandingSchema,
} from './theme/validator';
export type { ValidatedBranding, ValidatedOrgBranding } from './theme/validator';

// Sample data
export { sampleBrandingData } from './sample-data'; 