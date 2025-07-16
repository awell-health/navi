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
  if (!branding) {
    return '';
  }
  
  let fontCSS = '';
  
  // Font families
  if (branding.fontFamilyBody && typeof branding.fontFamilyBody === 'string') {
    fontCSS += `  --font-family-body: ${sanitizeCSSValue(branding.fontFamilyBody)};\n`;
  }
  
  if (branding.fontFamilyHeading && typeof branding.fontFamilyHeading === 'string') {
    fontCSS += `  --font-family-heading: ${sanitizeCSSValue(branding.fontFamilyHeading)};\n`;
  }
  
  if (branding.fontFamilyMono && typeof branding.fontFamilyMono === 'string') {
    fontCSS += `  --font-family-mono: ${sanitizeCSSValue(branding.fontFamilyMono)};\n`;
  }
  
  // Font sizes
  if (branding.fontSizeXs && typeof branding.fontSizeXs === 'string') {
    fontCSS += `  --font-size-xs: ${sanitizeCSSValue(branding.fontSizeXs)};\n`;
  }
  
  if (branding.fontSizeSm && typeof branding.fontSizeSm === 'string') {
    fontCSS += `  --font-size-sm: ${sanitizeCSSValue(branding.fontSizeSm)};\n`;
  }
  
  if (branding.fontSizeBase && typeof branding.fontSizeBase === 'string') {
    fontCSS += `  --font-size-base: ${sanitizeCSSValue(branding.fontSizeBase)};\n`;
  }
  
  if (branding.fontSizeLg && typeof branding.fontSizeLg === 'string') {
    fontCSS += `  --font-size-lg: ${sanitizeCSSValue(branding.fontSizeLg)};\n`;
  }
  
  if (branding.fontSizeXl && typeof branding.fontSizeXl === 'string') {
    fontCSS += `  --font-size-xl: ${sanitizeCSSValue(branding.fontSizeXl)};\n`;
  }
  
  if (branding.fontSize2xl && typeof branding.fontSize2xl === 'string') {
    fontCSS += `  --font-size-2xl: ${sanitizeCSSValue(branding.fontSize2xl)};\n`;
  }
  
  if (branding.fontSize3xl && typeof branding.fontSize3xl === 'string') {
    fontCSS += `  --font-size-3xl: ${sanitizeCSSValue(branding.fontSize3xl)};\n`;
  }
  
  if (branding.fontSize4xl && typeof branding.fontSize4xl === 'string') {
    fontCSS += `  --font-size-4xl: ${sanitizeCSSValue(branding.fontSize4xl)};\n`;
  }
  
  // Line heights
  if (branding.lineHeightTight && typeof branding.lineHeightTight === 'string') {
    fontCSS += `  --line-height-tight: ${sanitizeCSSValue(branding.lineHeightTight)};\n`;
  }
  
  if (branding.lineHeightNormal && typeof branding.lineHeightNormal === 'string') {
    fontCSS += `  --line-height-normal: ${sanitizeCSSValue(branding.lineHeightNormal)};\n`;
  }
  
  if (branding.lineHeightRelaxed && typeof branding.lineHeightRelaxed === 'string') {
    fontCSS += `  --line-height-relaxed: ${sanitizeCSSValue(branding.lineHeightRelaxed)};\n`;
  }
  
  // Font weights
  if (branding.fontWeightNormal && typeof branding.fontWeightNormal === 'string') {
    fontCSS += `  --font-weight-normal: ${sanitizeCSSValue(branding.fontWeightNormal)};\n`;
  }
  
  if (branding.fontWeightMedium && typeof branding.fontWeightMedium === 'string') {
    fontCSS += `  --font-weight-medium: ${sanitizeCSSValue(branding.fontWeightMedium)};\n`;
  }
  
  if (branding.fontWeightSemibold && typeof branding.fontWeightSemibold === 'string') {
    fontCSS += `  --font-weight-semibold: ${sanitizeCSSValue(branding.fontWeightSemibold)};\n`;
  }
  
  if (branding.fontWeightBold && typeof branding.fontWeightBold === 'string') {
    fontCSS += `  --font-weight-bold: ${sanitizeCSSValue(branding.fontWeightBold)};\n`;
  }
  
  if (branding.fontWeightExtrabold && typeof branding.fontWeightExtrabold === 'string') {
    fontCSS += `  --font-weight-extrabold: ${sanitizeCSSValue(branding.fontWeightExtrabold)};\n`;
  }
  
  // Generate typography component classes
  fontCSS += generateTypographyClasses(branding);
  
  return fontCSS;
}

function generateTypographyClasses(branding: OrgBranding['branding']): string {
  const headingFamily = branding.fontFamilyHeading ? sanitizeCSSValue(branding.fontFamilyHeading) : 'system-ui, sans-serif';
  const bodyFamily = branding.fontFamilyBody ? sanitizeCSSValue(branding.fontFamilyBody) : 'system-ui, sans-serif';
  const monoFamily = branding.fontFamilyMono ? sanitizeCSSValue(branding.fontFamilyMono) : 'ui-monospace, monospace';
  
  return `
  
  /* Typography component classes */
  .navi-h1 {
    font-family: ${headingFamily};
    font-size: ${branding.fontSize4xl ? sanitizeCSSValue(branding.fontSize4xl) : '2.25rem'};
    line-height: ${branding.lineHeightTight ? sanitizeCSSValue(branding.lineHeightTight) : '1.25'};
    font-weight: ${branding.fontWeightExtrabold ? sanitizeCSSValue(branding.fontWeightExtrabold) : '800'};
  }
  
  .navi-h2 {
    font-family: ${headingFamily};
    font-size: ${branding.fontSize3xl ? sanitizeCSSValue(branding.fontSize3xl) : '1.875rem'};
    line-height: ${branding.lineHeightTight ? sanitizeCSSValue(branding.lineHeightTight) : '1.25'};
    font-weight: ${branding.fontWeightSemibold ? sanitizeCSSValue(branding.fontWeightSemibold) : '600'};
  }
  
  .navi-h3 {
    font-family: ${headingFamily};
    font-size: ${branding.fontSize2xl ? sanitizeCSSValue(branding.fontSize2xl) : '1.5rem'};
    line-height: ${branding.lineHeightTight ? sanitizeCSSValue(branding.lineHeightTight) : '1.25'};
    font-weight: ${branding.fontWeightSemibold ? sanitizeCSSValue(branding.fontWeightSemibold) : '600'};
  }
  
  .navi-h4 {
    font-family: ${headingFamily};
    font-size: ${branding.fontSizeXl ? sanitizeCSSValue(branding.fontSizeXl) : '1.25rem'};
    line-height: ${branding.lineHeightTight ? sanitizeCSSValue(branding.lineHeightTight) : '1.25'};
    font-weight: ${branding.fontWeightMedium ? sanitizeCSSValue(branding.fontWeightMedium) : '500'};
  }
  
  .navi-p {
    font-family: ${bodyFamily};
    font-size: ${branding.fontSizeBase ? sanitizeCSSValue(branding.fontSizeBase) : '1rem'};
    line-height: ${branding.lineHeightRelaxed ? sanitizeCSSValue(branding.lineHeightRelaxed) : '1.625'};
    font-weight: ${branding.fontWeightNormal ? sanitizeCSSValue(branding.fontWeightNormal) : '400'};
  }
  
  .navi-lead {
    font-family: ${bodyFamily};
    font-size: ${branding.fontSizeXl ? sanitizeCSSValue(branding.fontSizeXl) : '1.25rem'};
    line-height: ${branding.lineHeightNormal ? sanitizeCSSValue(branding.lineHeightNormal) : '1.5'};
    font-weight: ${branding.fontWeightNormal ? sanitizeCSSValue(branding.fontWeightNormal) : '400'};
  }
  
  .navi-large {
    font-family: ${bodyFamily};
    font-size: ${branding.fontSizeLg ? sanitizeCSSValue(branding.fontSizeLg) : '1.125rem'};
    line-height: ${branding.lineHeightNormal ? sanitizeCSSValue(branding.lineHeightNormal) : '1.5'};
    font-weight: ${branding.fontWeightSemibold ? sanitizeCSSValue(branding.fontWeightSemibold) : '600'};
  }
  
  .navi-small {
    font-family: ${bodyFamily};
    font-size: ${branding.fontSizeSm ? sanitizeCSSValue(branding.fontSizeSm) : '0.875rem'};
    line-height: ${branding.lineHeightTight ? sanitizeCSSValue(branding.lineHeightTight) : '1.25'};
    font-weight: ${branding.fontWeightMedium ? sanitizeCSSValue(branding.fontWeightMedium) : '500'};
  }
  
  .navi-muted {
    font-family: ${bodyFamily};
    font-size: ${branding.fontSizeSm ? sanitizeCSSValue(branding.fontSizeSm) : '0.875rem'};
    line-height: ${branding.lineHeightNormal ? sanitizeCSSValue(branding.lineHeightNormal) : '1.5'};
    font-weight: ${branding.fontWeightNormal ? sanitizeCSSValue(branding.fontWeightNormal) : '400'};
  }
  
  .navi-code {
    font-family: ${monoFamily};
    font-size: ${branding.fontSizeSm ? sanitizeCSSValue(branding.fontSizeSm) : '0.875rem'};
    line-height: ${branding.lineHeightNormal ? sanitizeCSSValue(branding.lineHeightNormal) : '1.5'};
    font-weight: ${branding.fontWeightSemibold ? sanitizeCSSValue(branding.fontWeightSemibold) : '600'};
  }
`;
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