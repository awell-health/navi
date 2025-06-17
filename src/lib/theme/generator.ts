import { type OrgBranding, type ThemeTokens } from './types';
import { awellDefaultTheme } from './defaults';

export function generateThemeCSS(branding: OrgBranding['branding'] | null): string {
  const tokens = brandingToTokens(branding);
  
  const cssVars = Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
    
  const fontCSS = generateFontCSS(branding);
    
  return `:root {\n${cssVars}\n${fontCSS}}`;
}

export function brandingToTokens(branding: OrgBranding['branding'] | null): ThemeTokens {
  // Start with Awell defaults
  const tokens: ThemeTokens = { ...awellDefaultTheme };
  
  if (!branding) {
    return tokens;
  }
  
  // Map branding JSON to shadcn/ui tokens
  if (branding.primary) {
    tokens['--primary'] = branding.primary;
  }
  
  if (branding.onPrimary) {
    tokens['--primary-foreground'] = branding.onPrimary;
  }
  
  if (branding.secondary) {
    tokens['--secondary'] = branding.secondary;
  }
  
  if (branding.onSecondary) {
    tokens['--secondary-foreground'] = branding.onSecondary;
  }
  
  if (branding.background) {
    tokens['--background'] = branding.background;
    tokens['--card'] = branding.background;
    tokens['--popover'] = branding.background;
  }
  
  if (branding.onSurface) {
    tokens['--foreground'] = branding.onSurface;
    tokens['--card-foreground'] = branding.onSurface;
    tokens['--popover-foreground'] = branding.onSurface;
  }
  
  if (branding.surface) {
    tokens['--muted'] = branding.surface;
    tokens['--accent'] = branding.surface;
  }
  
  if (branding.onSurface) {
    tokens['--muted-foreground'] = branding.onSurface;
    tokens['--accent-foreground'] = branding.onSurface;
  }
  
  if (branding.error) {
    tokens['--destructive'] = branding.error;
  }
  
  if (branding.onError) {
    tokens['--destructive-foreground'] = branding.onError;
  }
  
  if (branding.border) {
    tokens['--border'] = branding.border;
    tokens['--input'] = branding.border;
  }
  
  if (branding.primary) {
    tokens['--ring'] = branding.primary;
  }
  
  if (branding.radiusMd) {
    // Extract just the numeric value if it contains 'var(--radiusMd)'
    const radiusValue = branding.radiusMd.replace(/var\(--radius\w*\)/, '').trim() || branding.radiusMd;
    tokens['--radius'] = radiusValue;
  }
  
  // Custom tokens
  if (branding.primaryHover) {
    tokens['--primary-hover'] = branding.primaryHover;
  }
  
  if (branding.shadowSm) {
    tokens['--shadow-sm'] = branding.shadowSm;
  }
  
  if (branding.shadowMd) {
    tokens['--shadow-md'] = branding.shadowMd;
  }
  
  if (branding.navHeight) {
    tokens['--nav-height'] = branding.navHeight;
  }
  
  return tokens;
}

export function generateFontCSS(branding: OrgBranding['branding'] | null): string {
  if (!branding?.fontFamilyBody && !branding?.fontFamilyHeading) {
    return '';
  }
  
  let fontCSS = '';
  
  if (branding.fontFamilyBody) {
    fontCSS += `  --font-body: ${branding.fontFamilyBody};\n`;
  }
  
  if (branding.fontFamilyHeading) {
    fontCSS += `  --font-heading: ${branding.fontFamilyHeading};\n`;
  }
  
  if (branding.fontSizeBase) {
    fontCSS += `  --font-size-base: ${branding.fontSizeBase};\n`;
  }
  
  if (branding.lineHeightBase) {
    fontCSS += `  --line-height-base: ${branding.lineHeightBase};\n`;
  }
  
  if (branding.fontWeightBold) {
    fontCSS += `  --font-weight-bold: ${branding.fontWeightBold};\n`;
  }
  
  return fontCSS;
}

export function generateInlineThemeStyle(branding: OrgBranding['branding'] | null): string {
  const css = generateThemeCSS(branding);
  return `<style id="awell-theme">\n${css}\n</style>`;
}

/**
 * Get the favicon URL with proper fallback handling
 */
export function getFaviconUrl(branding: OrgBranding['branding'] | null): string {
  return branding?.faviconUrl || '/favicon-16x16.png';
}

/**
 * Detect favicon MIME type from URL extension
 */
export function getFaviconType(faviconUrl: string): string {
  // Extract pathname and remove query params/fragments
  const pathname = faviconUrl.split('?')[0].split('#')[0];
  const extension = pathname.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'ico':
      return 'image/x-icon';
    case 'png':
      return 'image/png';
    case 'svg':
      return 'image/svg+xml';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/x-icon'; // Default fallback
  }
}

/**
 * Generate favicon HTML link tag with proper type detection
 */
export function generateFaviconHTML(branding: OrgBranding['branding'] | null): string {
  const faviconUrl = getFaviconUrl(branding);
  const faviconType = getFaviconType(faviconUrl);
  
  return `<link rel="icon" type="${faviconType}" href="${faviconUrl}">`;
} 