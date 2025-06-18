import { type OrgBranding, type ThemeTokens } from '../types';
import { awellDefaultTheme } from '../defaults';

export function generateThemeCSS(branding: OrgBranding['branding'] | null): string {
  const tokens = brandingToTokens(branding);
  
  const cssVars = Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
    
  const fontCSS = generateFontCSS(branding);
    
  return `:root {\n${cssVars}\n${fontCSS}}`;
}

// Simple CSS value sanitizer - removes dangerous characters without importing heavy libs
function sanitizeCSSValue(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  // Remove potentially dangerous CSS/HTML sequences
  return value
    .replace(/<\/style>/gi, '') // Remove closing style tags
    .replace(/<script/gi, '') // Remove script tag starts
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/expression\(/gi, '') // Remove CSS expressions
    .replace(/alert\(/gi, '') // Remove alert calls
    .replace(/['"<>]/g, '') // Remove quotes and angle brackets
    .replace(/[;}]/g, '') // Remove semicolons and closing braces that could break CSS
    .trim();
}

export function brandingToTokens(branding: OrgBranding['branding'] | null): ThemeTokens {
  // Start with Awell defaults
  const tokens: ThemeTokens = { ...awellDefaultTheme };
  
  if (!branding) {
    return tokens;
  }
  
  // Map branding JSON to shadcn/ui tokens
  if (branding.primary && typeof branding.primary === 'string') {
    tokens['--primary'] = sanitizeCSSValue(branding.primary);
  }
  
  if (branding.onPrimary && typeof branding.onPrimary === 'string') {
    tokens['--primary-foreground'] = sanitizeCSSValue(branding.onPrimary);
  }
  
  if (branding.secondary && typeof branding.secondary === 'string') {
    tokens['--secondary'] = sanitizeCSSValue(branding.secondary);
  }
  
  if (branding.onSecondary && typeof branding.onSecondary === 'string') {
    tokens['--secondary-foreground'] = sanitizeCSSValue(branding.onSecondary);
  }
  
  if (branding.background && typeof branding.background === 'string') {
    const sanitizedBg = sanitizeCSSValue(branding.background);
    tokens['--background'] = sanitizedBg;
    tokens['--card'] = sanitizedBg;
    tokens['--popover'] = sanitizedBg;
  }
  
  if (branding.onSurface && typeof branding.onSurface === 'string') {
    const sanitizedSurface = sanitizeCSSValue(branding.onSurface);
    tokens['--foreground'] = sanitizedSurface;
    tokens['--card-foreground'] = sanitizedSurface;
    tokens['--popover-foreground'] = sanitizedSurface;
  }
  
  if (branding.surface && typeof branding.surface === 'string') {
    const sanitizedSurface = sanitizeCSSValue(branding.surface);
    tokens['--muted'] = sanitizedSurface;
    tokens['--accent'] = sanitizedSurface;
  }
  
  if (branding.onSurface && typeof branding.onSurface === 'string') {
    const sanitizedOnSurface = sanitizeCSSValue(branding.onSurface);
    tokens['--muted-foreground'] = sanitizedOnSurface;
    tokens['--accent-foreground'] = sanitizedOnSurface;
  }
  
  if (branding.error && typeof branding.error === 'string') {
    tokens['--destructive'] = sanitizeCSSValue(branding.error);
  }
  
  if (branding.onError && typeof branding.onError === 'string') {
    tokens['--destructive-foreground'] = sanitizeCSSValue(branding.onError);
  }
  
  if (branding.border && typeof branding.border === 'string') {
    const sanitizedBorder = sanitizeCSSValue(branding.border);
    tokens['--border'] = sanitizedBorder;
    tokens['--input'] = sanitizedBorder;
  }
  
  if (branding.primary && typeof branding.primary === 'string') {
    tokens['--ring'] = sanitizeCSSValue(branding.primary);
  }
  
  if (branding.radiusMd && typeof branding.radiusMd === 'string') {
    // Extract just the numeric value if it contains 'var(--radiusMd)'
    const radiusValue = branding.radiusMd.replace(/var\(--radius\w*\)/, '').trim() || branding.radiusMd;
    tokens['--radius'] = sanitizeCSSValue(radiusValue);
  }
  
  // Custom tokens
  if (branding.primaryHover && typeof branding.primaryHover === 'string') {
    tokens['--primary-hover'] = sanitizeCSSValue(branding.primaryHover);
  }
  
  if (branding.shadowSm && typeof branding.shadowSm === 'string') {
    tokens['--shadow-sm'] = sanitizeCSSValue(branding.shadowSm);
  }
  
  if (branding.shadowMd && typeof branding.shadowMd === 'string') {
    tokens['--shadow-md'] = sanitizeCSSValue(branding.shadowMd);
  }
  
  if (branding.navHeight && typeof branding.navHeight === 'string') {
    tokens['--nav-height'] = sanitizeCSSValue(branding.navHeight);
  }
  
  return tokens;
}

export function generateFontCSS(branding: OrgBranding['branding'] | null): string {
  if (!branding?.fontFamilyBody && !branding?.fontFamilyHeading) {
    return '';
  }
  
  let fontCSS = '';
  
  if (branding.fontFamilyBody && typeof branding.fontFamilyBody === 'string') {
    fontCSS += `  --font-body: ${sanitizeCSSValue(branding.fontFamilyBody)};\n`;
  }
  
  if (branding.fontFamilyHeading && typeof branding.fontFamilyHeading === 'string') {
    fontCSS += `  --font-heading: ${sanitizeCSSValue(branding.fontFamilyHeading)};\n`;
  }
  
  if (branding.fontSizeBase && typeof branding.fontSizeBase === 'string') {
    fontCSS += `  --font-size-base: ${sanitizeCSSValue(branding.fontSizeBase)};\n`;
  }
  
  if (branding.lineHeightBase && typeof branding.lineHeightBase === 'string') {
    fontCSS += `  --line-height-base: ${sanitizeCSSValue(branding.lineHeightBase)};\n`;
  }
  
  if (branding.fontWeightBold && typeof branding.fontWeightBold === 'string') {
    fontCSS += `  --font-weight-bold: ${sanitizeCSSValue(branding.fontWeightBold)};\n`;
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